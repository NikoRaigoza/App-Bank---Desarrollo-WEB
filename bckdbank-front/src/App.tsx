import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ApiError, bankApi, marketApi, type Account, type AuthResponse, type CompanyProfile, type Quote, type Transaction, type TransferValues } from './lib/api'
import type { AuthMode } from './types/auth'
import AuthScreen from './components/AuthScreen'
import Dashboard from './components/Dashboard'
import './App.css'

function readSession(): AuthResponse | null {
  try {
    const saved = localStorage.getItem('bckdbank.session')
    if (!saved) return null
    const session = JSON.parse(saved) as AuthResponse
    return session.token && session.email ? session : null
  } catch {
    return null
  }
}

// Un 401 significa que el token ya no sirve (venció o es inválido): hay que volver al login.
function isSessionError(error: unknown) {
  return error instanceof ApiError && error.status === 401
}

function App() {
  const [session, setSession] = useState<AuthResponse | null>(readSession)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loadedDashboardKey, setLoadedDashboardKey] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [dashboardError, setDashboardError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [toast, setToast] = useState('')
  const [symbol, setSymbol] = useState('AAPL')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [marketError, setMarketError] = useState('')
  const [marketRetry, setMarketRetry] = useState(0)
  const [loadedMarketKey, setLoadedMarketKey] = useState('')

  // useCallback "memoriza" la función para que no cambie en cada render;
  // así puede usarse dentro de los useEffect sin dispararlos de nuevo.
  const logout = useCallback(() => {
    localStorage.removeItem('bckdbank.session')
    setSession(null)
    setAccounts([])
    setTransactions([])
    setQuote(null)
    setProfile(null)
    setSelectedId(null)
    setAuthMessage('')
  }, [])

  const expireSession = useCallback(() => {
    logout()
    setAuthMessage('Tu sesión venció. Inicia sesión nuevamente.')
  }, [logout])

  const dashboardRequestKey = session ? `${session.token}:${refreshKey}` : ''
  const marketRequestKey = session ? `${session.token}:${symbol}:${marketRetry}` : ''
  const loading = Boolean(session && loadedDashboardKey !== dashboardRequestKey)
  const marketLoading = Boolean(session && loadedMarketKey !== marketRequestKey)

  useEffect(() => {
    if (!session) return
    const token = session.token
    let active = true

    async function loadDashboard() {
      try {
        const nextAccounts = await bankApi.getAccounts(token)
        const histories = await Promise.all(
          nextAccounts.map((account) => bankApi.getTransactions(account.accountNumber, token)),
        )
        if (!active) return
        setAccounts(nextAccounts)
        setTransactions(
          histories.flat()
            .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
            .sort((left, right) => right.timestamp.localeCompare(left.timestamp)),
        )
        setSelectedId((current) =>
          nextAccounts.some((account) => account.id === current) ? current : (nextAccounts[0]?.id ?? null),
        )
        setDashboardError('')
      } catch (error) {
        if (!active) return
        if (isSessionError(error)) {
          expireSession()
        } else {
          setDashboardError(error instanceof Error ? error.message : 'No fue posible cargar tus cuentas.')
        }
      } finally {
        if (active) setLoadedDashboardKey(dashboardRequestKey)
      }
    }

    void loadDashboard()
    return () => { active = false }
  }, [session, refreshKey, dashboardRequestKey, expireSession])

  useEffect(() => {
    if (!session) return
    const token = session.token
    let active = true

    Promise.all([marketApi.getQuote(symbol, token), marketApi.getProfile(symbol, token)])
      .then(([nextQuote, nextProfile]) => {
        if (active) {
          setQuote(nextQuote)
          setProfile(nextProfile)
          setMarketError('')
        }
      })
      .catch((error: unknown) => {
        if (!active) return
        if (isSessionError(error)) expireSession()
        else setMarketError(error instanceof Error ? error.message : 'No se pudo consultar Finnhub.')
      })
      .finally(() => {
        if (active) setLoadedMarketKey(marketRequestKey)
      })

    return () => { active = false }
  }, [session, symbol, marketRetry, marketRequestKey, expireSession])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3600)
    return () => window.clearTimeout(timer)
  }, [toast])

  async function authenticate(mode: AuthMode, values: Record<string, string>) {
    setAuthMessage('')
    try {
      const next = mode === 'login'
        ? await bankApi.login(values.email, values.password)
        : await bankApi.register(values.firstName, values.lastName, values.email, values.password)
      localStorage.setItem('bckdbank.session', JSON.stringify(next))
      setSession(next)
      setToast(mode === 'register' ? 'Cuenta creada. Ya puedes comenzar.' : 'Sesión iniciada correctamente.')
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'No fue posible iniciar sesión.')
    }
  }


  function refreshDashboard() {
    setDashboardError('')
    setRefreshKey((value) => value + 1)
  }

  async function transfer(values: TransferValues) {
    if (!session) return
    try {
      await bankApi.transfer(values, session.token)
    } catch (error) {
      if (isSessionError(error)) expireSession()
      throw error
    }
    setDashboardError('')
    setToast('Transferencia realizada correctamente.')
    setRefreshKey((value) => value + 1)
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<AuthScreen onAuthenticate={authenticate} message={authMessage} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route
        path="*"
        element={(
          <Dashboard
            session={session}
            accounts={accounts}
            transactions={transactions}
            selectedAccountId={selectedId}
            loading={loading}
            dashboardError={dashboardError}
            quote={quote}
            profile={profile}
            symbol={symbol}
            marketLoading={marketLoading}
            marketError={marketError}
            toast={toast}
            onSelectAccount={setSelectedId}
            onRefresh={refreshDashboard}
            onLogout={logout}
            onSearchSymbol={setSymbol}
            onRetryMarket={() => setMarketRetry((value) => value + 1)}
            onTransfer={transfer}
            onDismissToast={() => setToast('')}
          />
        )}
      />
    </Routes>
  )
}

export default App

import { ArrowDownLeft, ArrowUpRight, ChartNoAxesColumn, Scale } from 'lucide-react'
import type { Account, Transaction } from '../lib/api'
import { formatMoney, shortDate } from '../lib/formatters'

interface CashflowPanelProps {
  account: Account | undefined
  transactions: Transaction[]
  loading: boolean
}

export default function CashflowPanel({ account, transactions, loading }: CashflowPanelProps) {
  const movements = transactions.map((transaction) => {
    const outgoing = transaction.sourceAccountNumber === account?.accountNumber
    return { ...transaction, signed: outgoing ? -transaction.amount : transaction.amount }
  })
  const incoming = movements.reduce((total, item) => total + Math.max(item.signed, 0), 0)
  const outgoing = movements.reduce((total, item) => total + Math.max(-item.signed, 0), 0)
  const net = incoming - outgoing
  const volume = incoming + outgoing
  const incomingShare = volume > 0 ? (incoming / volume) * 100 : 50
  const recent = movements.slice(0, 10).reverse()
  const peak = Math.max(...recent.map((item) => Math.abs(item.signed)), 1)

  return (
    <section className="panel cashflow-panel" aria-label="Flujo de caja">
      <div className="section-heading">
        <div><span className="eyebrow">ANÁLISIS</span><h2>Flujo de caja</h2></div>
        <span className="cashflow-badge"><ChartNoAxesColumn size={14} />{movements.length} mov.</span>
      </div>
      {loading ? (
        <div className="cashflow-skeleton"><span /><span /><span /></div>
      ) : movements.length === 0 ? (
        <div className="empty-state"><Scale size={22} /><p>Sin movimientos para analizar todavía.</p></div>
      ) : (
        <>
          <div className="cashflow-stats">
            <div className="cashflow-stat">
              <span className="cashflow-stat-icon cashflow-in"><ArrowDownLeft size={15} /></span>
              <small>Entradas</small>
              <strong>{formatMoney(incoming)}</strong>
            </div>
            <div className="cashflow-stat">
              <span className="cashflow-stat-icon cashflow-out"><ArrowUpRight size={15} /></span>
              <small>Salidas</small>
              <strong>{formatMoney(outgoing)}</strong>
            </div>
            <div className="cashflow-stat cashflow-net">
              <span className="cashflow-stat-icon"><Scale size={15} /></span>
              <small>Neto</small>
              <strong className={net >= 0 ? 'amount-in' : 'amount-out'}>
                {net >= 0 ? '+' : '−'}{formatMoney(Math.abs(net))}
              </strong>
            </div>
          </div>
          <div className="cashflow-ratio" role="img" aria-label={`${incomingShare.toFixed(0)}% entradas`}>
            <span style={{ width: `${incomingShare}%` }} />
          </div>
          <div className="cashflow-ratio-legend">
            <span>{incomingShare.toFixed(0)}% entradas</span>
            <span>{(100 - incomingShare).toFixed(0)}% salidas</span>
          </div>
          <div className="cashflow-bars" aria-label="Últimos movimientos">
            {recent.map((item) => (
              <span
                className="cashflow-bar-slot"
                key={item.id}
                title={`${shortDate.format(new Date(item.timestamp))} · ${item.signed >= 0 ? '+' : '−'}${formatMoney(Math.abs(item.signed))}`}
              >
                <i
                  className={item.signed >= 0 ? 'bar-in' : 'bar-out'}
                  style={{ height: `${Math.max((Math.abs(item.signed) / peak) * 100, 6)}%` }}
                />
              </span>
            ))}
          </div>
          <div className="cashflow-caption">Últimos {recent.length} movimientos de •••• {account?.accountNumber.slice(-4)}</div>
        </>
      )}
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, Mail, UserRound } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import type { AuthResponse } from '../lib/api'

interface DashboardHeaderProps {
  session: AuthResponse
  onLogout: () => void
}

export default function DashboardHeader({ session, onLogout }: DashboardHeaderProps) {
  const { pathname } = useLocation()
  // Estado local: ¿el menú del perfil está abierto o cerrado?
  const [menuOpen, setMenuOpen] = useState(false)
  // Referencia al contenedor del menú para saber si un clic fue "dentro" o "fuera".
  const menuRef = useRef<HTMLDivElement>(null)

  const pageName = pathname === '/accounts'
    ? 'Mis cuentas'
    : pathname === '/activity'
      ? 'Movimientos'
      : 'Resumen'
  const fullName = [session.firstName, session.lastName].filter(Boolean).join(' ') || session.email
  const initial = (session.firstName || session.email).slice(0, 1).toUpperCase()

  // Mientras el menú está abierto, se cierra con un clic fuera de él o con la tecla Escape.
  useEffect(() => {
    if (!menuOpen) return

    function onPointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    // Limpieza: quitamos los "escuchadores" cuando el menú se cierra.
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Área personal</span><span className="breadcrumb-slash">/</span><strong>{pageName}</strong>
      </div>
      <div className="topbar-actions">
        <div className="status-pill"><span className="status-dot" />Sesión segura</div>
        <div className="profile-menu" ref={menuRef}>
          <button
            className="profile-trigger"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Abrir menú de perfil"
          >
            <span className="avatar">{initial}</span>
            <span className="profile-email">{session.email}</span>
            <ChevronDown className={`profile-chevron ${menuOpen ? 'is-open' : ''}`} size={16} />
          </button>

          {menuOpen && (
            <div className="profile-dropdown" role="menu">
              <div className="profile-dropdown-head">
                <span className="avatar avatar-lg">{initial}</span>
                <span>
                  <strong>{fullName}</strong>
                  <small>{session.role === 'ROLE_ADMIN' ? 'Administrador' : 'Cliente'}</small>
                </span>
              </div>
              <div className="profile-dropdown-info">
                <span><UserRound size={15} />{fullName}</span>
                <span><Mail size={15} />{session.email}</span>
              </div>
              <button className="profile-dropdown-item" role="menuitem" disabled title="Requiere un endpoint en el backend">
                <UserRound size={16} />Editar perfil <small>Próximamente</small>
              </button>
              <button
                className="profile-dropdown-item profile-dropdown-logout"
                role="menuitem"
                onClick={() => { setMenuOpen(false); onLogout() }}
              >
                <LogOut size={16} />Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

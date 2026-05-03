'use client'

import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronDown, UserCircle } from 'lucide-react'
import { useState } from 'react'

const serif = { fontFamily: 'var(--font-cormorant)' } as React.CSSProperties

export default function PublicNav() {
  const { user, logout, loading } = useUser()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    router.push('/')
  }

  return (
    <nav className="flex items-center justify-between px-6 md:px-10 py-3 bg-white border-b border-gray-100">
      {/* Wordmark */}
      <a href="/" className="flex items-center gap-2.5 group">
        <div
          className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold select-none"
          style={{ backgroundColor: '#1B2A4A', color: '#C8960C', fontFamily: 'var(--font-cormorant)', fontSize: '15px' }}
        >
          ®
        </div>
        <span
          className="text-lg font-semibold tracking-[0.12em] uppercase"
          style={{ ...serif, color: '#1B2A4A' }}
        >
          Marcas NI
        </span>
      </a>

      {!loading && (
        <div className="flex items-center gap-2">
          <a
            href="/registrar-marca"
            className="hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors"
            style={{ backgroundColor: '#C8960C' }}
          >
            Registrar marca
          </a>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors text-gray-700"
              >
                <UserCircle size={14} className="text-gray-400" />
                <span className="hidden sm:inline max-w-[120px] truncate">{user.nombre}</span>
                <ChevronDown size={11} className="text-gray-400" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-20 py-1 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-50">
                      <p className="text-xs font-semibold text-gray-800 truncate">{user.nombre}</p>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <a
                      href="/cuenta"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <UserCircle size={13} className="text-gray-400" /> Mi cuenta
                    </a>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={13} /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <a href="/acceder" className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5">
                Acceder
              </a>
              <a
                href="/registro"
                className="text-xs font-semibold px-4 py-1.5 rounded-lg text-white transition-colors"
                style={{ backgroundColor: '#1B2A4A' }}
              >
                Registrarse
              </a>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

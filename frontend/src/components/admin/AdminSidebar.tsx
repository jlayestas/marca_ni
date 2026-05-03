'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FilePlus, Home, X, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

function getToken() {
  if (typeof document === 'undefined') return ''
  return document.cookie.split('; ').find(r => r.startsWith('admin_token='))?.split('=')[1] ?? ''
}

interface Props {
  isOpen?: boolean
  onClose?: () => void
}

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/submissions/count`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(data => { if (typeof data.count === 'number') setPendingCount(data.count) })
      .catch(() => {})
  }, [pathname])

  const NAV = [
    { href: '/admin', label: 'Panel', icon: LayoutDashboard, exact: true, badge: 0 },
    { href: '/admin/nueva', label: 'Nueva Marca', icon: FilePlus, exact: false, badge: 0 },
    { href: '/admin/solicitudes', label: 'Solicitudes', icon: Inbox, exact: false, badge: pendingCount },
  ]

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full w-56 flex flex-col z-30 transition-transform duration-300',
        'md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
      style={{ backgroundColor: '#1B2A4A' }}
    >
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center font-black text-xs shrink-0"
            style={{ backgroundColor: '#C8960C', color: '#1B2A4A' }}
          >
            M
          </div>
          <span className="text-white font-bold text-sm tracking-wide">Marcas NI</span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-lg text-white/60 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, exact, badge }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#C8960C', color: '#1B2A4A' }}>
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-5">
        <div className="border-t border-white/10 pt-4 space-y-0.5">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            <Home size={16} /> Ir al inicio
          </Link>
          <p className="text-white/30 text-xs px-3 pt-2">v1.0.0</p>
        </div>
      </div>
    </aside>
  )
}

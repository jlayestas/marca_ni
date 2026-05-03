'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()

  const logout = () => {
    document.cookie = 'admin_token=; path=/; max-age=0'
    router.push('/login')
  }

  return (
    <button
      onClick={logout}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
      title="Cerrar sesión"
    >
      <LogOut size={14} />
      <span className="hidden sm:block">Salir</span>
    </button>
  )
}

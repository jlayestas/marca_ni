'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Credenciales incorrectas.')
        return
      }

      // Store token in cookie (7 days)
      document.cookie = `admin_token=${data.token}; path=/; max-age=${60 * 60 * 8}; SameSite=Strict`
      router.push('/admin')
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg mx-auto mb-4"
            style={{ backgroundColor: '#1B2A4A', color: '#C8960C' }}
          >
            M
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#1B2A4A' }}>Marcas NI</h1>
          <p className="text-sm text-gray-500 mt-1">Inicia sesión para continuar</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                <ShieldCheck size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <div className={cn(
                'flex items-center gap-2.5 border rounded-xl px-3 py-2.5 transition-all',
                'border-gray-200 bg-white focus-within:ring-2 focus-within:ring-navy/10 focus-within:border-navy/50'
              )}>
                <Mail size={15} className="text-gray-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@marcasni.com"
                  className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className={cn(
                'flex items-center gap-2.5 border rounded-xl px-3 py-2.5 transition-all',
                'border-gray-200 bg-white focus-within:ring-2 focus-within:ring-navy/10 focus-within:border-navy/50'
              )}>
                <Lock size={15} className="text-gray-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#1B2A4A' }}
            >
              {loading ? 'Verificando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <a href="/" className="hover:text-navy transition-colors">← Volver al inicio</a>
        </p>
      </div>
    </div>
  )
}

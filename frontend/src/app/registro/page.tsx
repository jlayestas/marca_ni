'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Eye, EyeOff, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/context/UserContext'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface FormState {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface TouchedState {
  firstName: boolean
  lastName: boolean
  email: boolean
  password: boolean
}

function getFieldError(field: keyof FormState, value: string): string {
  switch (field) {
    case 'firstName': return value.trim() ? '' : 'El nombre es requerido.'
    case 'lastName':  return value.trim() ? '' : 'El apellido es requerido.'
    case 'email':     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Ingresa un correo válido.'
    case 'password':  return value.length >= 8 ? '' : 'La contraseña debe tener al menos 8 caracteres.'
    default: return ''
  }
}

export default function RegistroPage() {
  const router = useRouter()
  const { login } = useUser()
  const [form, setForm] = useState<FormState>({ firstName: '', lastName: '', email: '', password: '' })
  const [touched, setTouched] = useState<TouchedState>({ firstName: false, lastName: false, email: false, password: false })
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field: keyof FormState, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const blur = (field: keyof FormState) =>
    setTouched(prev => ({ ...prev, [field]: true }))

  const errors: Record<keyof FormState, string> = {
    firstName: getFieldError('firstName', form.firstName),
    lastName:  getFieldError('lastName',  form.lastName),
    email:     getFieldError('email',     form.email),
    password:  getFieldError('password',  form.password),
  }

  const hasErrors = Object.values(errors).some(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ firstName: true, lastName: true, email: true, password: true })
    if (hasErrors) return
    setServerError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) { setServerError(data.error || 'Error al crear la cuenta.'); return }
      login(data)
      router.push('/')
    } catch {
      setServerError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg mx-auto mb-4" style={{ backgroundColor: '#1B2A4A', color: '#C8960C' }}>M</div>
            <h1 className="text-xl font-bold" style={{ color: '#1B2A4A' }}>Marcas NI</h1>
          </a>
          <p className="text-sm text-gray-500 mt-1">Crea tu cuenta gratuita</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {serverError && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                {serverError}
              </div>
            )}

            {/* First + Last name row */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre" error={touched.firstName ? errors.firstName : ''}>
                <InputWrap icon={<User size={15} className="text-gray-400" />} hasError={!!(touched.firstName && errors.firstName)}>
                  <input
                    type="text" value={form.firstName}
                    onChange={e => set('firstName', e.target.value)}
                    onBlur={() => blur('firstName')}
                    placeholder="Ana" autoFocus
                    className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder:text-gray-400 min-w-0"
                  />
                </InputWrap>
              </Field>

              <Field label="Apellido" error={touched.lastName ? errors.lastName : ''}>
                <InputWrap icon={null} hasError={!!(touched.lastName && errors.lastName)}>
                  <input
                    type="text" value={form.lastName}
                    onChange={e => set('lastName', e.target.value)}
                    onBlur={() => blur('lastName')}
                    placeholder="García"
                    className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder:text-gray-400 min-w-0"
                  />
                </InputWrap>
              </Field>
            </div>

            <Field label="Correo electrónico" error={touched.email ? errors.email : ''}>
              <InputWrap icon={<Mail size={15} className="text-gray-400" />} hasError={!!(touched.email && errors.email)}>
                <input
                  type="email" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  onBlur={() => blur('email')}
                  placeholder="tu@correo.com" autoComplete="email"
                  className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
                />
              </InputWrap>
            </Field>

            <Field label="Contraseña" error={touched.password ? errors.password : ''}>
              <InputWrap icon={<Lock size={15} className="text-gray-400" />} hasError={!!(touched.password && errors.password)}>
                <input
                  type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  onBlur={() => blur('password')}
                  placeholder="Mínimo 8 caracteres" autoComplete="new-password"
                  className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </InputWrap>
            </Field>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-60 mt-2"
              style={{ backgroundColor: '#1B2A4A' }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-5">
          ¿Ya tienes cuenta?{' '}
          <a href="/acceder" className="font-semibold hover:underline" style={{ color: '#1B2A4A' }}>
            Inicia sesión
          </a>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          <a href="/" className="hover:text-gray-600 transition-colors">← Volver al inicio</a>
        </p>
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function InputWrap({ icon, hasError, children }: { icon: React.ReactNode; hasError: boolean; children: React.ReactNode }) {
  return (
    <div className={cn(
      'flex items-center gap-2.5 border rounded-xl px-3 py-2.5 transition-all',
      hasError
        ? 'border-red-300 bg-red-50 focus-within:ring-2 focus-within:ring-red-100'
        : 'border-gray-200 bg-white focus-within:ring-2 focus-within:ring-navy/10 focus-within:border-navy/50'
    )}>
      {icon}
      {children}
    </div>
  )
}

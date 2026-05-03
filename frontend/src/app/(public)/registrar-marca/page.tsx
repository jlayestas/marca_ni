'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  AtSign, Share2, Globe, Music2, Phone,
  Plus, Trash2, Upload, X, ChevronRight, ChevronLeft,
  CheckCircle,
} from 'lucide-react'
import PublicNav from '@/components/PublicNav'
import StepIndicator from '@/components/ui/StepIndicator'
import { cn } from '@/lib/utils'
import { useUser } from '@/context/UserContext'
import { getUserToken } from '@/lib/userAuth'
import { NICE_CLASSES } from '@/lib/niceClasses'
import type { TrademarkStatus } from '@/types/trademark'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const STEPS = ['Identidad', 'Titular', 'Contacto']

interface FormData {
  nombre_marca: string
  marca_denominativa: string
  marca_figurativa: File | null
  marca_figurativa_preview: string | null
  status: TrademarkStatus
  nice_class: number | null
  dueno: string
  contactos: string[]
  instagram: string
  facebook: string
  tiktok: string
  website: string
  direccion: string
}

const EMPTY: FormData = {
  nombre_marca: '',
  marca_denominativa: '',
  marca_figurativa: null,
  marca_figurativa_preview: null,
  status: 'En Tramite',
  nice_class: null,
  dueno: '',
  contactos: ['+505 '],
  instagram: '',
  facebook: '',
  tiktok: '',
  website: '',
  direccion: '',
}

export default function RegistrarMarcaPage() {
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Pre-fill owner name from user account
  useEffect(() => {
    if (user && !form.dueno) {
      setForm(prev => ({ ...prev, dueno: user.nombre }))
    }
  }, [user])

  const set = (field: keyof FormData, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleImageFile = (file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowed.includes(file.type)) return
    setForm(prev => ({ ...prev, marca_figurativa: file, marca_figurativa_preview: URL.createObjectURL(file) }))
  }

  const removeImage = () =>
    setForm(p => ({ ...p, marca_figurativa: null, marca_figurativa_preview: null }))

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageFile(file)
  }, [])

  const validateStep = () => {
    const errs: Partial<Record<keyof FormData, string>> = {}
    if (step === 1) {
      if (!form.nombre_marca.trim()) errs.nombre_marca = 'Este campo es requerido'
      if (!form.marca_denominativa.trim()) errs.marca_denominativa = 'Este campo es requerido'
    }
    if (step === 2) {
      if (!form.dueno.trim()) errs.dueno = 'Este campo es requerido'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => { if (validateStep()) setStep(s => s + 1) }
  const back = () => setStep(s => s - 1)

  const addPhone = () => {
    if (form.contactos.length >= 5) return
    set('contactos', [...form.contactos, '+505 '])
  }
  const updatePhone = (i: number, val: string) => {
    const updated = [...form.contactos]
    updated[i] = val
    set('contactos', updated)
  }
  const removePhone = (i: number) =>
    set('contactos', form.contactos.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    if (!validateStep()) return
    setIsSubmitting(true)

    const token = getUserToken()
    let imageUrl: string | undefined

    if (form.marca_figurativa) {
      const fd = new FormData()
      fd.append('file', form.marca_figurativa)
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      try {
        const res = await fetch(`${API_BASE}/api/admin/upload`, {
          method: 'POST',
          headers,
          body: fd,
        })
        if (res.ok) imageUrl = (await res.json()).url
      } catch {}
    }

    const payload = {
      nombre_marca: form.nombre_marca,
      marca_denominativa: form.marca_denominativa,
      marca_figurativa: imageUrl,
      status: form.status,
      nice_class: form.nice_class,
      dueno: form.dueno,
      contactos: form.contactos.filter(c => c.trim() !== '+505' && c.trim() !== '+505 '),
      redes_sociales: {
        instagram: form.instagram || undefined,
        facebook: form.facebook || undefined,
        tiktok: form.tiktok || undefined,
        website: form.website || undefined,
      },
      direccion: form.direccion,
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
      const res = await fetch(`${API_BASE}/api/trademarks/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setErrors({ nombre_marca: 'Error al enviar. Intenta de nuevo.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
        <PublicNav />
        <div className="max-w-md mx-auto px-4 pt-20 pb-10 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
            <div className="w-14 h-14 rounded-full bg-green-50 mx-auto mb-5 flex items-center justify-center">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">¡Solicitud enviada!</h1>
            <p className="text-sm text-gray-500 mb-6">
              Tu solicitud ha sido recibida y está pendiente de revisión por nuestro equipo. Te notificaremos cuando sea aprobada.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setSubmitted(false); setForm(EMPTY); setStep(1) }}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
                style={{ backgroundColor: '#1B2A4A' }}
              >
                Registrar otra marca
              </button>
              <a href="/" className="w-full py-2.5 rounded-xl text-sm font-semibold text-center text-gray-600 hover:text-gray-800 transition-colors">
                Volver al inicio
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <PublicNav />

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Registrar una marca</h1>
          <p className="text-sm text-gray-500 mt-1">
            Completa el formulario y nuestro equipo revisará tu solicitud.
          </p>
        </div>

        {errors.nombre_marca && step === 3 && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {errors.nombre_marca}
          </div>
        )}

        <StepIndicator currentStep={step} steps={STEPS} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Step 1 — Identidad */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-base font-semibold text-navy border-b border-gray-100 pb-3">Identidad de la Marca</h2>

              <FormField label="Nombre de la marca" error={errors.nombre_marca} required>
                <input type="text" value={form.nombre_marca} onChange={e => set('nombre_marca', e.target.value)}
                  placeholder="Ej. Café Dorado" className={inputCls(!!errors.nombre_marca)} />
              </FormField>

              <FormField label="Marca denominativa" error={errors.marca_denominativa} required>
                <input type="text" value={form.marca_denominativa} onChange={e => set('marca_denominativa', e.target.value)}
                  placeholder="Nombre exacto tal como deseas registrarlo" className={inputCls(!!errors.marca_denominativa)} />
              </FormField>

              <FormField label="Logo (opcional)">
                {form.marca_figurativa_preview ? (
                  <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                    <img src={form.marca_figurativa_preview} alt="preview"
                      className="w-20 h-20 object-contain rounded-lg border border-gray-100 bg-gray-50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{form.marca_figurativa?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {form.marca_figurativa ? (form.marca_figurativa.size / 1024).toFixed(1) + ' KB' : ''}
                      </p>
                    </div>
                    <button onClick={removeImage} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => fileRef.current?.click()}
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all select-none',
                      isDragging ? 'border-navy bg-navy/5' : 'border-gray-200 bg-gray-50 hover:border-navy/50 hover:bg-navy/5'
                    )}
                  >
                    <Upload size={22} className={isDragging ? 'text-navy' : 'text-gray-400'} />
                    <p className="text-sm text-gray-500 text-center">
                      <span className="font-semibold text-navy">Selecciona un archivo</span> o arrastra aquí
                    </p>
                    <p className="text-xs text-gray-400">JPG, PNG, WebP, SVG · máx. 5 MB</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden" onChange={e => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]) }} />
              </FormField>
            </div>
          )}

          {/* Step 2 — Titular */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-base font-semibold text-navy border-b border-gray-100 pb-3">Estado y Titular</h2>

              <FormField label="Estado actual de la marca" required>
                <select value={form.status} onChange={e => set('status', e.target.value as TrademarkStatus)} className={inputCls(false)}>
                  <option value="En Tramite">En Trámite</option>
                  <option value="Registrada">Registrada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </FormField>

              <FormField label="Clase NICE">
                <select
                  value={form.nice_class ?? ''}
                  onChange={e => set('nice_class', e.target.value ? Number(e.target.value) : null)}
                  className={inputCls(false)}
                >
                  <option value="">Sin clasificar</option>
                  {NICE_CLASSES.map(c => (
                    <option key={c.number} value={c.number}>
                      Clase {c.number} — {c.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Titular de la marca" error={errors.dueno} required>
                <input type="text" value={form.dueno} onChange={e => set('dueno', e.target.value)}
                  placeholder="Nombre completo o razón social" className={inputCls(!!errors.dueno)} />
              </FormField>
            </div>
          )}

          {/* Step 3 — Contacto */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-base font-semibold text-navy border-b border-gray-100 pb-3">Información de Contacto</h2>

              <FormField label="Números de contacto">
                <div className="space-y-2">
                  {form.contactos.map((phone, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus-within:border-navy/50 focus-within:ring-2 focus-within:ring-navy/10 transition-all">
                        <Phone size={14} className="text-gray-400 shrink-0" />
                        <input type="tel" value={phone} onChange={e => updatePhone(i, e.target.value)}
                          className="flex-1 text-sm outline-none bg-transparent" />
                      </div>
                      {form.contactos.length > 1 && (
                        <button onClick={() => removePhone(i)}
                          className="p-2.5 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition-all">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  {form.contactos.length < 5 && (
                    <button onClick={addPhone} className="flex items-center gap-1.5 text-sm font-medium text-navy hover:underline mt-1">
                      <Plus size={14} /> Agregar número
                    </button>
                  )}
                </div>
              </FormField>

              <FormField label="Redes sociales">
                <div className="space-y-2.5">
                  <SocialInput icon={<AtSign size={15} className="text-pink-500" />} placeholder="instagram.com/usuario" value={form.instagram} onChange={v => set('instagram', v)} />
                  <SocialInput icon={<Share2 size={15} className="text-blue-600" />} placeholder="facebook.com/pagina" value={form.facebook} onChange={v => set('facebook', v)} />
                  <SocialInput icon={<Music2 size={15} className="text-gray-700" />} placeholder="tiktok.com/@usuario" value={form.tiktok} onChange={v => set('tiktok', v)} />
                  <SocialInput icon={<Globe size={15} className="text-navy" />} placeholder="www.sitio.com" value={form.website} onChange={v => set('website', v)} />
                </div>
              </FormField>

              <FormField label="Dirección física">
                <textarea value={form.direccion} onChange={e => set('direccion', e.target.value)}
                  placeholder="Dirección completa del negocio o titular" rows={3}
                  className={cn(inputCls(false), 'resize-none')} />
              </FormField>
            </div>
          )}

          {/* Navigation */}
          <div className={cn('flex mt-8 pt-6 border-t border-gray-100', step > 1 ? 'justify-between' : 'justify-end')}>
            {step > 1 && (
              <button onClick={back}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <ChevronLeft size={15} /> Atrás
              </button>
            )}

            {step < 3 ? (
              <button onClick={next}
                className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-colors ml-auto"
                style={{ backgroundColor: '#1B2A4A' }}>
                Siguiente <ChevronRight size={15} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#C8960C' }}>
                {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Tu solicitud será revisada por nuestro equipo antes de ser publicada.
        </p>
      </div>
    </div>
  )
}

function FormField({ label, children, error, required }: { label: string; children: React.ReactNode; error?: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function SocialInput({ icon, placeholder, value, onChange }: { icon: React.ReactNode; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus-within:ring-2 transition-all">
      {icon}
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder:text-gray-400" />
    </div>
  )
}

function inputCls(hasError: boolean) {
  return cn(
    'w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-all bg-white',
    hasError ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-navy/60 focus:ring-2 focus:ring-navy/10'
  )
}

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  AtSign, Share2, Globe, Music2, Phone,
  Plus, Trash2, Upload, X, ChevronRight, ChevronLeft, RotateCcw,
} from 'lucide-react'
import StepIndicator from '@/components/ui/StepIndicator'
import { cn } from '@/lib/utils'
import type { Trademark, TrademarkStatus } from '@/types/trademark'
import { NICE_CLASSES } from '@/lib/niceClasses'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const STEPS = ['Identidad', 'Titular', 'Contacto']
const DRAFT_KEY = 'marcasni_intake_draft'
const AUTOSAVE_INTERVAL = 30_000

type SerializableFormData = Omit<FormData, 'marca_figurativa' | 'marca_figurativa_preview'>

function saveDraft(form: FormData, step: number) {
  try {
    const data: SerializableFormData & { step: number; savedAt: string } = {
      nombre_marca: form.nombre_marca,
      marca_denominativa: form.marca_denominativa,
      marca_figurativa_existing: form.marca_figurativa_existing,
      status: form.status,
      nice_class: form.nice_class,
      dueno: form.dueno,
      contactos: form.contactos,
      instagram: form.instagram,
      facebook: form.facebook,
      tiktok: form.tiktok,
      website: form.website,
      direccion: form.direccion,
      step,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
  } catch {}
}

function loadDraft(): (SerializableFormData & { step: number; savedAt: string }) | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY) } catch {}
}

function formatSavedAt(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  return `hace ${Math.floor(diff / 3600)} h`
}

interface FormData {
  nombre_marca: string
  marca_denominativa: string
  marca_figurativa: File | null
  marca_figurativa_preview: string | null   // blob URL (new file) or existing URL
  marca_figurativa_existing: string | null  // URL already in DB
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
  marca_figurativa_existing: null,
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

function fromTrademark(tm: Trademark): FormData {
  return {
    nombre_marca: tm.nombre_marca,
    marca_denominativa: tm.marca_denominativa,
    marca_figurativa: null,
    marca_figurativa_preview: tm.marca_figurativa || null,
    marca_figurativa_existing: tm.marca_figurativa || null,
    status: tm.status,
    nice_class: tm.nice_class ?? null,
    dueno: tm.dueno,
    contactos: tm.contactos?.length ? tm.contactos : ['+505 '],
    instagram: tm.redes_sociales?.instagram || '',
    facebook: tm.redes_sociales?.facebook || '',
    tiktok: tm.redes_sociales?.tiktok || '',
    website: tm.redes_sociales?.website || '',
    direccion: tm.direccion || '',
  }
}

function getToken() {
  return document.cookie.split('; ').find(r => r.startsWith('admin_token='))?.split('=')[1] ?? ''
}

interface Props {
  initialData?: Trademark
  trademarkId?: string
  submissionMode?: boolean  // edit a pending submission; save = edit + approve
}

export default function IntakeForm({ initialData, trademarkId, submissionMode = false }: Props) {
  const router = useRouter()
  const isEdit = !!trademarkId
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialData ? fromTrademark(initialData) : EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isDragging, setIsDragging] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [draftInfo, setDraftInfo] = useState<{ savedAt: string; step: number } | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // On mount: check for existing draft (create mode only)
  useEffect(() => {
    if (isEdit) return
    const draft = loadDraft()
    if (draft && draft.nombre_marca) {
      setDraftInfo({ savedAt: draft.savedAt, step: draft.step })
      setShowDraftBanner(true)
    }
  }, [isEdit])

  // Auto-save every 30s (create mode only)
  useEffect(() => {
    if (isEdit) return
    const interval = setInterval(() => {
      saveDraft(form, step)
      setLastSaved(new Date().toISOString())
    }, AUTOSAVE_INTERVAL)
    return () => clearInterval(interval)
  }, [form, step, isEdit])

  // Keyboard shortcuts — only active on step 3
  const submitRef = useRef<(published: boolean) => Promise<void>>(undefined)
  useEffect(() => {
    submitRef.current = submit
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const modifier = isMac ? e.metaKey : e.ctrlKey
      if (!modifier || step !== 3) return

      if (e.key === 's') {
        e.preventDefault()
        submitRef.current?.(false)
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        submitRef.current?.(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [step])

  const restoreDraft = () => {
    const draft = loadDraft()
    if (!draft) return
    setForm(prev => ({
      ...prev,
      nombre_marca: draft.nombre_marca,
      marca_denominativa: draft.marca_denominativa,
      marca_figurativa_existing: draft.marca_figurativa_existing,
      marca_figurativa_preview: draft.marca_figurativa_existing || null,
      status: draft.status,
      nice_class: draft.nice_class ?? null,
      dueno: draft.dueno,
      contactos: draft.contactos,
      instagram: draft.instagram,
      facebook: draft.facebook,
      tiktok: draft.tiktok,
      website: draft.website,
      direccion: draft.direccion,
    }))
    setStep(draft.step)
    setShowDraftBanner(false)
  }

  const discardDraft = () => {
    clearDraft()
    setShowDraftBanner(false)
  }

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
    setForm(p => ({ ...p, marca_figurativa: null, marca_figurativa_preview: null, marca_figurativa_existing: null }))

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

  const submit = async (published: boolean) => {
    if (!validateStep()) return
    setIsSubmitting(true)

    let imageUrl: string | undefined = form.marca_figurativa_existing ?? undefined

    if (form.marca_figurativa) {
      const fd = new FormData()
      fd.append('file', form.marca_figurativa)
      try {
        const res = await fetch(`${API_BASE}/api/admin/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
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
      published,
    }

    try {
      let url: string
      let method: string
      if (submissionMode) {
        url = `${API_BASE}/api/admin/submissions/${trademarkId}/edit-and-approve`
        method = 'PATCH'
      } else if (isEdit) {
        url = `${API_BASE}/api/trademarks/${trademarkId}`
        method = 'PATCH'
      } else {
        url = `${API_BASE}/api/trademarks`
        method = 'POST'
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error()

      if (isEdit || submissionMode) {
        router.push(submissionMode ? '/admin/solicitudes' : '/admin')
      } else {
        clearDraft()
        setLastSaved(null)
        setSuccessMsg(published ? '¡Marca publicada exitosamente!' : 'Borrador guardado correctamente.')
        setForm(EMPTY)
        setStep(1)
      }
    } catch {
      setSuccessMsg('Error al guardar. Revisa la conexión con el servidor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {successMsg && (
        <div className={cn(
          'mb-6 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between',
          successMsg.startsWith('Error')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        )}>
          {successMsg}
          <button onClick={() => setSuccessMsg('')} className="ml-4 shrink-0"><X size={14} /></button>
        </div>
      )}

      {/* Draft restore banner */}
      {showDraftBanner && draftInfo && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <RotateCcw size={15} className="text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              Tienes un borrador guardado{' '}
              <span className="font-medium">{formatSavedAt(draftInfo.savedAt)}</span>.
              ¿Deseas restaurarlo?
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={restoreDraft}
              className="px-3 py-1.5 text-xs font-bold rounded-lg text-white transition-colors"
              style={{ backgroundColor: '#1B2A4A' }}
            >
              Restaurar
            </button>
            <button
              onClick={discardDraft}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-amber-700 hover:bg-amber-100 transition-colors"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      <StepIndicator currentStep={step} steps={STEPS} />

      {/* Auto-save indicator (create mode only) */}
      {!isEdit && lastSaved && (
        <p className="text-xs text-gray-400 text-right mb-3">
          Borrador guardado automáticamente · {formatSavedAt(lastSaved)}
        </p>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Step 1 — Identidad */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-navy border-b border-gray-100 pb-3">Identidad de la Marca</h2>

            <Field label="Nombre de la marca" error={errors.nombre_marca} required>
              <input type="text" value={form.nombre_marca} onChange={e => set('nombre_marca', e.target.value)}
                placeholder="Ej. Café Dorado" className={inputCls(!!errors.nombre_marca)} />
            </Field>

            <Field label="Marca denominativa" error={errors.marca_denominativa} required>
              <input type="text" value={form.marca_denominativa} onChange={e => set('marca_denominativa', e.target.value)}
                placeholder="Nombre exacto tal como aparece registrado" className={inputCls(!!errors.marca_denominativa)} />
            </Field>

            <Field label="Marca figurativa (logo)">
              {form.marca_figurativa_preview ? (
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                  <img src={form.marca_figurativa_preview} alt="preview"
                    className="w-20 h-20 object-contain rounded-lg border border-gray-100 bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {form.marca_figurativa?.name ?? 'Imagen actual'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {form.marca_figurativa
                        ? (form.marca_figurativa.size / 1024).toFixed(1) + ' KB'
                        : 'Subir nueva imagen para reemplazar'}
                    </p>
                  </div>
                  <button onClick={removeImage}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
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
            </Field>
          </div>
        )}

        {/* Step 2 — Estado y Titular */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-navy border-b border-gray-100 pb-3">Estado y Titular</h2>

            <Field label="Estado de la marca" required>
              <select value={form.status} onChange={e => set('status', e.target.value as TrademarkStatus)} className={inputCls(false)}>
                <option value="En Tramite">En Trámite</option>
                <option value="Registrada">Registrada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </Field>

            <Field label="Clase NICE">
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
            </Field>

            <Field label="Dueño de la marca" error={errors.dueno} required>
              <input type="text" value={form.dueno} onChange={e => set('dueno', e.target.value)}
                placeholder="Nombre completo o razón social" className={inputCls(!!errors.dueno)} />
            </Field>
          </div>
        )}

        {/* Step 3 — Contacto */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-navy border-b border-gray-100 pb-3">Información de Contacto</h2>

            <Field label="Números de contacto">
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
            </Field>

            <Field label="Redes sociales">
              <div className="space-y-2.5">
                <SocialInput icon={<AtSign size={15} className="text-pink-500" />} placeholder="instagram.com/usuario" value={form.instagram} onChange={v => set('instagram', v)} />
                <SocialInput icon={<Share2 size={15} className="text-blue-600" />} placeholder="facebook.com/pagina" value={form.facebook} onChange={v => set('facebook', v)} />
                <SocialInput icon={<Music2 size={15} className="text-gray-700" />} placeholder="tiktok.com/@usuario" value={form.tiktok} onChange={v => set('tiktok', v)} />
                <SocialInput icon={<Globe size={15} className="text-navy" />} placeholder="www.sitio.com" value={form.website} onChange={v => set('website', v)} />
              </div>
            </Field>

            <Field label="Dirección física">
              <textarea value={form.direccion} onChange={e => set('direccion', e.target.value)}
                placeholder="Dirección completa del negocio o titular" rows={3}
                className={cn(inputCls(false), 'resize-none')} />
            </Field>
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
          ) : submissionMode ? (
            <button onClick={() => submit(true)} disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#C8960C' }}>
              {isSubmitting ? 'Aprobando...' : 'Guardar y aprobar'}
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => submit(false)} disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl border-2 transition-colors disabled:opacity-50"
                style={{ color: '#1B2A4A', borderColor: '#1B2A4A' }}>
                {isEdit ? 'Guardar cambios' : 'Guardar borrador'}
              </button>
              {!isEdit && (
                <button onClick={() => submit(true)} disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#C8960C' }}>
                  {isSubmitting ? 'Publicando...' : 'Publicar'}
                </button>
              )}
              {isEdit && (
                <button onClick={() => submit(true)} disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#C8960C' }}>
                  {isSubmitting ? 'Guardando...' : 'Guardar y publicar'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, error, required }: { label: string; children: React.ReactNode; error?: string; required?: boolean }) {
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

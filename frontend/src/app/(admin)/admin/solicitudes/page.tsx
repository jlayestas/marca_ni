'use client'

import { useEffect, useState } from 'react'
import {
  ImageOff, Loader2, CheckCircle, XCircle, Clock, User,
  Eye, X, Phone, MapPin, Globe, AtSign, Share2, Music2, Tag, Calendar, Pencil,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Submission } from '@/types/trademark'
import { cn } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { getNiceClassLabel } from '@/lib/niceClasses'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

function getToken() {
  return document.cookie.split('; ').find(r => r.startsWith('admin_token='))?.split('=')[1] ?? ''
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-NI', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SolicitudesPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Submission | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionNote, setRejectionNote] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/submissions`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setSubmissions(data)
        else setError('No se pudieron cargar las solicitudes.')
      })
      .catch(() => setError('Error al conectar con el servidor.'))
      .finally(() => setLoading(false))
  }, [])

  const removeSubmission = (id: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id + '-approve')
    try {
      const res = await fetch(`${API_BASE}/api/admin/submissions/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (res.ok) removeSubmission(id)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    setActionLoading(id + '-reject')
    try {
      const res = await fetch(`${API_BASE}/api/admin/submissions/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ rejection_note: rejectionNote.trim() || null }),
      })
      if (res.ok) {
        removeSubmission(id)
        setRejectingId(null)
        setRejectionNote('')
      }
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Solicitudes de Registro</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {loading ? 'Cargando...' : `${submissions.length} solicitudes pendientes de revisión`}
        </p>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Cargando solicitudes...</span>
          </div>
        )}

        {error && <div className="text-center py-16 text-sm text-red-500">{error}</div>}

        {!loading && !error && submissions.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle size={36} className="text-green-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700">Todo al día</p>
            <p className="text-xs text-gray-400 mt-1">No hay solicitudes pendientes de revisión.</p>
          </div>
        )}

        {!loading && submissions.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Logo</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Marca</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Dueño</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Solicitante</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s, i) => (
                    <tr
                      key={s.id}
                      className={cn(
                        'cursor-pointer transition-colors',
                        selected?.id === s.id ? 'bg-navy/5' : i % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/60 hover:bg-gray-100/60'
                      )}
                      onClick={() => setSelected(s)}
                    >
                      <td className="px-5 py-3.5">
                        {s.marca_figurativa ? (
                          <img src={s.marca_figurativa} alt={s.nombre_marca} className="w-9 h-9 object-contain rounded-lg border border-gray-100" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center">
                            <ImageOff size={14} className="text-gray-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-800">{s.nombre_marca}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{s.marca_denominativa}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{s.dueno}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-gray-400" />
                          <div>
                            <p className="text-xs font-medium text-gray-700">{s.submitter_nombre ?? '—'}</p>
                            <p className="text-[11px] text-gray-400">{s.submitter_email ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{formatDate(s.created_at)}</td>
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelected(s)}
                            className="p-1.5 rounded-lg hover:bg-navy/10 text-gray-400 hover:text-navy transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleApprove(s.id)}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle size={13} />
                            {actionLoading === s.id + '-approve' ? 'Aprobando...' : 'Aprobar'}
                          </button>
                          <button
                            onClick={() => { setRejectingId(s.id); setRejectionNote('') }}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
                          >
                            <XCircle size={13} />
                            Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {submissions.map(s => (
                <div key={s.id} className="p-4 space-y-3">
                  <button className="flex items-center gap-3 w-full text-left" onClick={() => setSelected(s)}>
                    <div className="w-10 h-10 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                      {s.marca_figurativa
                        ? <img src={s.marca_figurativa} alt={s.nombre_marca} className="w-full h-full object-contain" />
                        : <ImageOff size={14} className="text-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{s.nombre_marca}</p>
                      <p className="text-xs text-gray-500 truncate">{s.dueno}</p>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{s.submitter_email ?? '—'} · {formatDate(s.created_at)}</p>
                    </div>
                    <Eye size={14} className="text-gray-300 shrink-0" />
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(s.id)}
                      disabled={!!actionLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle size={13} /> Aprobar
                    </button>
                    <button
                      onClick={() => { setRejectingId(s.id); setRejectionNote('') }}
                      disabled={!!actionLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      <XCircle size={13} /> Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && submissions.length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <Clock size={12} />
          Las solicitudes aprobadas se publican automáticamente y aparecen en el Panel.
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <DetailDrawer
          submission={selected}
          actionLoading={actionLoading}
          onClose={() => setSelected(null)}
          onApprove={() => handleApprove(selected.id)}
          onReject={() => { setRejectingId(selected.id); setRejectionNote('') }}
        />
      )}

      {/* Reject modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRejectingId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <XCircle size={18} className="text-red-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base">Rechazar solicitud</h2>
                <p className="text-xs text-gray-500 mt-0.5">Puedes incluir un motivo para el solicitante (opcional).</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Motivo del rechazo</label>
              <textarea
                value={rejectionNote}
                onChange={e => setRejectionNote(e.target.value)}
                placeholder="Ej. La denominativa ya está registrada con una marca similar..."
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none resize-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all bg-white"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setRejectingId(null)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReject(rejectingId)}
                disabled={!!actionLoading}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {actionLoading === rejectingId + '-reject' ? 'Rechazando...' : 'Confirmar rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────

interface DrawerProps {
  submission: Submission
  actionLoading: string | null
  onClose: () => void
  onApprove: () => void
  onReject: () => void
}

function DetailDrawer({ submission: s, actionLoading, onClose, onApprove, onReject }: DrawerProps) {
  const router = useRouter()
  const social = s.redes_sociales ?? {}
  const hasSocial = Object.values(social).some(Boolean)
  const hasContacts = s.contactos?.length > 0

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
              {s.marca_figurativa
                ? <img src={s.marca_figurativa} alt={s.nombre_marca} className="w-full h-full object-contain" />
                : <ImageOff size={13} className="text-gray-300" />}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-gray-900 text-sm truncate">{s.nombre_marca}</h2>
              <p className="text-[11px] text-gray-400 font-mono truncate">{s.marca_denominativa}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0 ml-3">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Logo */}
          {s.marca_figurativa && (
            <div className="flex justify-center">
              <img
                src={s.marca_figurativa}
                alt={s.nombre_marca}
                className="max-h-36 max-w-full object-contain rounded-xl border border-gray-100 bg-gray-50 p-3"
              />
            </div>
          )}

          {/* Identity */}
          <Section title="Identidad">
            <Row label="Nombre">{s.nombre_marca}</Row>
            <Row label="Denominativa"><span className="font-mono text-xs">{s.marca_denominativa}</span></Row>
            <Row label="Estado"><Badge status={s.status} /></Row>
            {s.nice_class && (
              <Row label="Clase NICE">
                <span className="inline-flex items-center gap-1.5">
                  <Tag size={12} className="text-gray-400" />
                  Clase {s.nice_class} — {getNiceClassLabel(s.nice_class)}
                </span>
              </Row>
            )}
          </Section>

          {/* Owner */}
          <Section title="Titular">
            <Row label="Nombre / Razón social">{s.dueno}</Row>
            {s.direccion && (
              <Row label="Dirección">
                <span className="flex items-start gap-1.5">
                  <MapPin size={13} className="text-gray-400 mt-0.5 shrink-0" />
                  {s.direccion}
                </span>
              </Row>
            )}
          </Section>

          {/* Contacts */}
          {hasContacts && (
            <Section title="Contacto">
              <div className="space-y-2">
                {s.contactos.map((phone, i) => (
                  <a key={i} href={`tel:${phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-navy transition-colors">
                    <Phone size={13} className="text-gray-400 shrink-0" />
                    {phone}
                  </a>
                ))}
              </div>
            </Section>
          )}

          {/* Social */}
          {hasSocial && (
            <Section title="Redes sociales">
              <div className="space-y-2">
                {social.instagram && (
                  <SocialRow icon={<AtSign size={13} className="text-pink-500" />} href={`https://instagram.com/${social.instagram.replace(/.*instagram\.com\//, '')}`} label={social.instagram} />
                )}
                {social.facebook && (
                  <SocialRow icon={<Share2 size={13} className="text-blue-600" />} href={`https://facebook.com/${social.facebook.replace(/.*facebook\.com\//, '')}`} label={social.facebook} />
                )}
                {social.tiktok && (
                  <SocialRow icon={<Music2 size={13} className="text-gray-700" />} href={`https://tiktok.com/${social.tiktok.replace(/.*tiktok\.com\//, '')}`} label={social.tiktok} />
                )}
                {social.website && (
                  <SocialRow icon={<Globe size={13} style={{ color: '#1B2A4A' }} />} href={social.website.startsWith('http') ? social.website : `https://${social.website}`} label={social.website} />
                )}
              </div>
            </Section>
          )}

          {/* Submitter */}
          <Section title="Solicitante">
            <Row label="Nombre">{s.submitter_nombre ?? '—'}</Row>
            <Row label="Correo">{s.submitter_email ?? '—'}</Row>
            <Row label="Enviado">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="text-gray-400" />
                {formatDate(s.created_at)}
              </span>
            </Row>
          </Section>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white space-y-2">
          <button
            onClick={() => router.push(`/admin/solicitudes/${s.id}`)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-xl border-2 transition-colors"
            style={{ color: '#1B2A4A', borderColor: '#1B2A4A' }}
          >
            <Pencil size={15} />
            Editar y aprobar
          </button>
          <div className="flex gap-2">
            <button
              onClick={onReject}
              disabled={!!actionLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-xl text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              <XCircle size={15} />
              Rechazar
            </button>
            <button
              onClick={onApprove}
              disabled={!!actionLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-xl text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              <CheckCircle size={15} />
              {actionLoading === s.id + '-approve' ? 'Aprobando...' : 'Aprobar'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-2.5">{children}</div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-gray-400 shrink-0 text-xs pt-0.5">{label}</span>
      <span className="text-gray-800 text-right font-medium">{children}</span>
    </div>
  )
}

function SocialRow({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-gray-700 hover:text-navy transition-colors group">
      {icon}
      <span className="truncate">{label}</span>
    </a>
  )
}

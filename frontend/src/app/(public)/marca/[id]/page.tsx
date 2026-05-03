'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Phone,
  MapPin,
  Globe,
  AtSign,
  Share2,
  Music2,
  ImageOff,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Tag,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import PublicNav from '@/components/PublicNav'
import type { Trademark } from '@/types/trademark'
import { getNiceClassLabel } from '@/lib/niceClasses'
import { useUser } from '@/context/UserContext'
import { getUserToken } from '@/lib/userAuth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

function useBookmark(trademarkId: string | undefined) {
  const { user } = useUser()
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    if (!user || !trademarkId) return
    const token = getUserToken()
    fetch(`${API_BASE}/api/users/me/bookmarks`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setIsBookmarked(data.some((b: { id: string }) => b.id === trademarkId)) })
      .catch(() => {})
  }, [user, trademarkId])

  const toggle = async () => {
    if (!user || !trademarkId) { return }
    const token = getUserToken()
    setIsBookmarked(v => !v)
    await fetch(
      isBookmarked ? `${API_BASE}/api/users/me/bookmarks/${trademarkId}` : `${API_BASE}/api/users/me/bookmarks`,
      {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: isBookmarked ? undefined : JSON.stringify({ trademark_id: trademarkId }),
      }
    ).catch(() => setIsBookmarked(v => !v))
  }

  return { isBookmarked, toggle, user }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' })
}

function StatusIcon({ status }: { status: Trademark['status'] }) {
  if (status === 'Registrada') return <CheckCircle size={16} className="text-green-500" />
  if (status === 'En Tramite') return <Clock size={16} className="text-amber-500" />
  return <XCircle size={16} className="text-gray-400" />
}

export default function TrademarkDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [trademark, setTrademark] = useState<Trademark | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const { isBookmarked, toggle, user } = useBookmark(id)

  useEffect(() => {
    fetch(`${API_BASE}/api/trademarks/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then(data => { if (data) setTrademark(data) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const social = trademark?.redes_sociales ?? {}
  const hasSocial = Object.values(social).some(Boolean)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <PublicNav />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-6">
          <ArrowLeft size={15} /> Volver a la búsqueda
        </Link>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
            <div className="space-y-4 animate-pulse">
              <div className="flex gap-6">
                <div className="w-36 h-36 rounded-xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-3 pt-2">
                  <div className="h-6 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Not found */}
        {!loading && notFound && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-4xl mb-4">🔍</p>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Marca no encontrada</h2>
            <p className="text-sm text-gray-500 mb-6">Esta marca no existe o no está publicada.</p>
            <Link href="/" className="text-sm font-semibold text-navy hover:underline">Ir al buscador</Link>
          </div>
        )}

        {/* Detail */}
        {!loading && trademark && (
          <div className="space-y-4">
            {/* Main card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Top stripe */}
              <div className="h-2 w-full" style={{ backgroundColor: '#1B2A4A' }} />

              <div className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Logo */}
                  <div className="shrink-0 flex flex-col items-center gap-3">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-2 border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {trademark.marca_figurativa ? (
                        <img
                          src={trademark.marca_figurativa}
                          alt={trademark.nombre_marca}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <ImageOff size={32} className="text-gray-300" />
                      )}
                    </div>
                    <Badge status={trademark.status} />
                  </div>

                  {/* Core info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                          {trademark.nombre_marca}
                        </h1>
                        <p className="text-sm font-mono text-gray-400 mt-1">{trademark.marca_denominativa}</p>
                      </div>
                      <button
                        onClick={toggle}
                        title={isBookmarked ? 'Quitar de guardados' : user ? 'Guardar marca' : 'Inicia sesión para guardar'}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                          isBookmarked ? 'border-amber-400 text-amber-600 bg-amber-50' : 'border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500'
                        }`}
                      >
                        {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                        {isBookmarked ? 'Guardada' : 'Guardar'}
                      </button>
                    </div>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InfoRow icon={<StatusIcon status={trademark.status} />} label="Estado">
                        <span className={
                          trademark.status === 'Registrada' ? 'text-green-700 font-semibold' :
                          trademark.status === 'En Tramite' ? 'text-amber-700 font-semibold' :
                          'text-gray-500 font-semibold'
                        }>
                          {trademark.status === 'En Tramite' ? 'En Trámite' : trademark.status}
                        </span>
                      </InfoRow>

                      <InfoRow icon={<Building2 size={15} className="text-gray-400" />} label="Titular">
                        {trademark.dueno}
                      </InfoRow>

                      {trademark.direccion && (
                        <InfoRow icon={<MapPin size={15} className="text-gray-400" />} label="Dirección">
                          {trademark.direccion}
                        </InfoRow>
                      )}

                      {trademark.nice_class && (
                        <InfoRow icon={<Tag size={15} className="text-gray-400" />} label="Clase NICE">
                          Clase {trademark.nice_class} — {getNiceClassLabel(trademark.nice_class)}
                        </InfoRow>
                      )}

                      <InfoRow icon={<Calendar size={15} className="text-gray-400" />} label="Registrado">
                        {formatDate(trademark.created_at)}
                      </InfoRow>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact + Social */}
            {(trademark.contactos?.length > 0 || hasSocial) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone numbers */}
                {trademark.contactos?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contacto</h2>
                    <ul className="space-y-2.5">
                      {trademark.contactos.map((phone, i) => (
                        <li key={i}>
                          <a
                            href={`tel:${phone.replace(/\s/g, '')}`}
                            className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-navy transition-colors group"
                          >
                            <span className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center shrink-0 group-hover:bg-navy/10 transition-colors">
                              <Phone size={14} style={{ color: '#1B2A4A' }} />
                            </span>
                            {phone}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Social links */}
                {hasSocial && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Redes sociales</h2>
                    <ul className="space-y-2.5">
                      {social.instagram && (
                        <SocialLink href={`https://instagram.com/${social.instagram.replace(/.*instagram\.com\//, '')}`} icon={<AtSign size={14} className="text-pink-500" />} label={social.instagram} />
                      )}
                      {social.facebook && (
                        <SocialLink href={`https://facebook.com/${social.facebook.replace(/.*facebook\.com\//, '')}`} icon={<Share2 size={14} className="text-blue-600" />} label={social.facebook} />
                      )}
                      {social.tiktok && (
                        <SocialLink href={`https://tiktok.com/${social.tiktok.replace(/.*tiktok\.com\//, '')}`} icon={<Music2 size={14} className="text-gray-700" />} label={social.tiktok} />
                      )}
                      {social.website && (
                        <SocialLink href={social.website.startsWith('http') ? social.website : `https://${social.website}`} icon={<Globe size={14} style={{ color: '#1B2A4A' }} />} label={social.website} />
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Legal disclaimer */}
            <p className="text-xs text-gray-400 text-center pb-4">
              La información mostrada es orientativa y no constituye asesoría legal. Consulta con un profesional antes de registrar tu marca.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-700 mt-0.5">{children}</p>
      </div>
    </div>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-navy transition-colors group"
      >
        <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition-colors">
          {icon}
        </span>
        <span className="truncate">{label}</span>
        <ExternalLink size={11} className="text-gray-300 shrink-0 ml-auto group-hover:text-gray-400 transition-colors" />
      </a>
    </li>
  )
}

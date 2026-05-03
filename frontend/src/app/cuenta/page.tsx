'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bookmark, Trash2, ExternalLink, Tag, Clock } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { getUserToken } from '@/lib/userAuth'
import PublicNav from '@/components/PublicNav'
import Badge from '@/components/ui/Badge'
import type { Trademark } from '@/types/trademark'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface SavedSearch {
  id: string
  query: string
  filters: Record<string, unknown>
  created_at: string
}

interface BookmarkedTrademark extends Trademark {
  bookmark_id: string
  bookmarked_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-NI', { year: 'numeric', month: 'short', day: 'numeric' })
}

function filtersLabel(filters: Record<string, unknown>): string {
  const parts: string[] = []
  if (filters.status && filters.status !== 'Todas') parts.push(String(filters.status))
  if (filters.niceClass) parts.push(`Clase ${filters.niceClass}`)
  if (filters.owner) parts.push(`Titular: ${filters.owner}`)
  if (filters.dateFrom) parts.push(`Desde ${filters.dateFrom}`)
  if (filters.dateTo) parts.push(`Hasta ${filters.dateTo}`)
  return parts.join(' · ')
}

export default function CuentaPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [bookmarks, setBookmarks] = useState<BookmarkedTrademark[]>([])
  const [tab, setTab] = useState<'searches' | 'bookmarks'>('searches')
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace('/acceder'); return }

    const token = getUserToken()
    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(`${API_BASE}/api/users/me/searches`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/users/me/bookmarks`, { headers }).then(r => r.json()),
    ]).then(([s, b]) => {
      setSearches(Array.isArray(s) ? s : [])
      setBookmarks(Array.isArray(b) ? b : [])
    }).finally(() => setDataLoading(false))
  }, [user, loading, router])

  const deleteSearch = async (id: string) => {
    const token = getUserToken()
    await fetch(`${API_BASE}/api/users/me/searches/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setSearches(prev => prev.filter(s => s.id !== id))
  }

  const removeBookmark = async (trademarkId: string) => {
    const token = getUserToken()
    await fetch(`${API_BASE}/api/users/me/bookmarks/${trademarkId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setBookmarks(prev => prev.filter(b => b.id !== trademarkId))
  }

  if (loading || !user) return null

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F5' }}>
      <PublicNav />

      <div className="max-w-3xl mx-auto w-full px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold" style={{ color: '#1B2A4A' }}>Mi cuenta</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white rounded-xl border border-gray-100 shadow-sm mb-6 w-fit">
          {([
            { id: 'searches', label: 'Búsquedas guardadas', icon: <Search size={13} />, count: searches.length },
            { id: 'bookmarks', label: 'Marcas guardadas', icon: <Bookmark size={13} />, count: bookmarks.length },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t.id ? 'text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
              style={tab === t.id ? { backgroundColor: '#1B2A4A' } : {}}
            >
              {t.icon} {t.label}
              {t.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {dataLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-gray-100 animate-pulse" />)}
          </div>
        )}

        {/* Saved Searches */}
        {!dataLoading && tab === 'searches' && (
          <div className="space-y-3">
            {searches.length === 0 ? (
              <EmptyState icon={<Search size={24} className="text-gray-300" />} message="Aún no tienes búsquedas guardadas." sub="Guarda una búsqueda desde la página principal." />
            ) : searches.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <a
                    href={`/?q=${encodeURIComponent(s.query)}`}
                    className="flex items-center gap-2 text-sm font-bold hover:underline group"
                    style={{ color: '#1B2A4A' }}
                  >
                    <Search size={13} className="shrink-0" />
                    <span className="truncate">"{s.query}"</span>
                    <ExternalLink size={11} className="text-gray-300 group-hover:text-gray-400 shrink-0" />
                  </a>
                  {filtersLabel(s.filters) && (
                    <p className="text-xs text-gray-400 mt-0.5 ml-5">{filtersLabel(s.filters)}</p>
                  )}
                  <p className="text-xs text-gray-300 mt-1 ml-5 flex items-center gap-1">
                    <Clock size={10} /> {formatDate(s.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => deleteSearch(s.id)}
                  className="shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bookmarks */}
        {!dataLoading && tab === 'bookmarks' && (
          <div className="space-y-3">
            {bookmarks.length === 0 ? (
              <EmptyState icon={<Bookmark size={24} className="text-gray-300" />} message="Aún no tienes marcas guardadas." sub="Guarda una marca desde los resultados de búsqueda o la página de detalle." />
            ) : bookmarks.map(b => (
              <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
                {b.marca_figurativa ? (
                  <img src={b.marca_figurativa} alt={b.nombre_marca} className="w-12 h-12 object-contain rounded-lg border border-gray-100 bg-gray-50 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg border border-gray-100 bg-gray-50 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <a href={`/marca/${b.id}`} className="flex items-center gap-1.5 text-sm font-bold hover:underline group" style={{ color: '#1B2A4A' }}>
                    <span className="truncate">{b.nombre_marca}</span>
                    <ExternalLink size={11} className="text-gray-300 group-hover:text-gray-400 shrink-0" />
                  </a>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge status={b.status} />
                    {b.nice_class && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Tag size={10} /> Clase {b.nice_class}
                      </span>
                    )}
                    <span className="text-xs text-gray-300">{b.dueno}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeBookmark(b.id)}
                  className="shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon, message, sub }: { icon: React.ReactNode; message: string; sub: string }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-sm font-semibold text-gray-500">{message}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}

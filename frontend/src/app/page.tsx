'use client'

import { useState, useCallback, useEffect } from 'react'
import { ShieldCheck, Loader2, SlidersHorizontal, X, FileDown, Bookmark, BookmarkCheck } from 'lucide-react'
import SearchBar from '@/components/search/SearchBar'
import ResultCard from '@/components/search/ResultCard'
import NiceClassPicker from '@/components/search/NiceClassPicker'
import DateInput from '@/components/search/DateInput'
import PublicNav from '@/components/PublicNav'
import { cn } from '@/lib/utils'
import type { SearchResult, TrademarkStatus } from '@/types/trademark'
import { exportSearchPdf } from '@/lib/exportPdf'
import { useUser } from '@/context/UserContext'
import { getUserToken } from '@/lib/userAuth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const NAVY  = '#1B2A4A'
const GOLD  = '#C8960C'
const serif = { fontFamily: 'var(--font-cormorant)' } as React.CSSProperties

type StatusFilter = TrademarkStatus | 'Todas'

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'Todas',      value: 'Todas'       },
  { label: 'Registrada', value: 'Registrada'  },
  { label: 'En Trámite', value: 'En Tramite'  },
  { label: 'Cancelada',  value: 'Cancelada'   },
]

interface Filters {
  status: StatusFilter
  niceClass: number | null
  owner: string
  dateFrom: string
  dateTo: string
}

const EMPTY_FILTERS: Filters = { status: 'Todas', niceClass: null, owner: '', dateFrom: '', dateTo: '' }

async function fetchResults(query: string, page: number, filters: Filters) {
  const params = new URLSearchParams({ q: query, page: String(page) })
  if (filters.status !== 'Todas') params.set('status', filters.status)
  if (filters.niceClass)          params.set('nice_class', String(filters.niceClass))
  if (filters.owner.trim())       params.set('owner', filters.owner.trim())
  if (filters.dateFrom)           params.set('date_from', filters.dateFrom)
  if (filters.dateTo)             params.set('date_to', filters.dateTo)
  const res = await fetch(`${API_BASE}/api/search?${params}`)
  if (!res.ok) return { results: [] as SearchResult[], hasMore: false }
  return res.json() as Promise<{ results: SearchResult[]; hasMore: boolean }>
}

const hasAdvancedFilters = (f: Filters) => !!f.owner.trim() || !!f.dateFrom || !!f.dateTo
const hasAnyFilter       = (f: Filters) => f.status !== 'Todas' || !!f.niceClass || hasAdvancedFilters(f)

export default function HomePage() {
  const { user } = useUser()
  const [results, setResults]         = useState<SearchResult[]>([])
  const [query, setQuery]             = useState('')
  const [page, setPage]               = useState(0)
  const [hasMore, setHasMore]         = useState(false)
  const [loading, setLoading]         = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filters, setFilters]         = useState<Filters>(EMPTY_FILTERS)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [savingSearch, setSavingSearch]   = useState(false)
  const [saveMsg, setSaveMsg]             = useState('')

  const hasQuery       = query.trim().length > 0
  const anyActive      = hasAnyFilter(filters)
  const advancedActive = hasAdvancedFilters(filters)

  useEffect(() => {
    if (!user) { setBookmarkedIds(new Set()); return }
    const token = getUserToken()
    fetch(`${API_BASE}/api/users/me/bookmarks`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBookmarkedIds(new Set(data.map((b: { id: string }) => b.id))) })
      .catch(() => {})
  }, [user])

  const runSearch = useCallback(async (q: string, f: Filters) => {
    setPage(0); setLoading(true)
    try {
      const data = await fetchResults(q, 0, f)
      setResults(data.results); setHasMore(data.hasMore)
    } finally { setLoading(false) }
  }, [])

  const handleSearch = useCallback(async (q: string) => {
    if (!q) { setQuery(''); setResults([]); setHasMore(false); setPage(0); return }
    setQuery(q)
    await runSearch(q, filters)
  }, [filters, runSearch])

  const applyFilter = async (patch: Partial<Filters>) => {
    const next = { ...filters, ...patch }
    setFilters(next)
    if (!query) return
    await runSearch(query, next)
  }

  const clearAllFilters = async () => {
    setFilters(EMPTY_FILTERS)
    if (!query) return
    await runSearch(query, EMPTY_FILTERS)
  }

  const loadMore = async () => {
    const nextPage = page + 1
    setLoadingMore(true)
    try {
      const data = await fetchResults(query, nextPage, filters)
      setResults(prev => [...prev, ...data.results])
      setHasMore(data.hasMore); setPage(nextPage)
    } finally { setLoadingMore(false) }
  }

  const toast = (msg: string) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(''), 3000) }

  const saveSearch = async () => {
    if (!user) { toast('Inicia sesión para guardar búsquedas'); return }
    setSavingSearch(true)
    try {
      const token = getUserToken()
      const res = await fetch(`${API_BASE}/api/users/me/searches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query, filters }),
      })
      toast(res.ok ? '¡Búsqueda guardada!' : 'Error al guardar')
    } finally { setSavingSearch(false) }
  }

  const toggleBookmark = async (trademarkId: string) => {
    if (!user) { toast('Inicia sesión para guardar marcas'); return }
    const token = getUserToken()
    const isBookmarked = bookmarkedIds.has(trademarkId)
    setBookmarkedIds(prev => { const s = new Set(prev); isBookmarked ? s.delete(trademarkId) : s.add(trademarkId); return s })
    await fetch(
      isBookmarked ? `${API_BASE}/api/users/me/bookmarks/${trademarkId}` : `${API_BASE}/api/users/me/bookmarks`,
      {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: isBookmarked ? undefined : JSON.stringify({ trademark_id: trademarkId }),
      }
    ).catch(() => setBookmarkedIds(prev => { const s = new Set(prev); isBookmarked ? s.add(trademarkId) : s.delete(trademarkId); return s }))
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAFAF8' }}>
      <PublicNav />

      {/* Toast */}
      {saveMsg && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl text-white text-xs font-medium shadow-xl"
          style={{ backgroundColor: NAVY }}>
          {saveMsg}
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ backgroundColor: NAVY }}>
        {/* Dot grid texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle, rgba(200,150,12,0.18) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }} />

        {/* Decorative large ® */}
        <div
          className="absolute right-[4%] top-1/2 -translate-y-1/2 select-none pointer-events-none hidden lg:block"
          style={{ ...serif, fontSize: '260px', lineHeight: 1, color: 'rgba(200,150,12,0.06)' }}
        >
          ®
        </div>

        <div className="relative max-w-4xl mx-auto px-6 md:px-10">
          {/* Expanded content — fades out when query is active */}
          {!hasQuery && (
            <div className="pt-16 md:pt-24 pb-8">
              <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-7" style={{ color: GOLD }}>
                República de Nicaragua · MIFIC
              </p>

              <h1
                className="text-5xl md:text-7xl lg:text-8xl font-semibold text-white leading-[1.02] mb-8"
                style={serif}
              >
                Registro de<br />
                <em style={{ color: GOLD, fontStyle: 'italic' }}>Marcas</em>{' '}
                Comerciales
              </h1>

              <p className="text-white/40 text-sm mb-10 max-w-sm leading-relaxed">
                Verifica si el nombre que quieres usar para tu empresa ya está registrado en Nicaragua.
              </p>
            </div>
          )}

          {/* SearchBar — always mounted, never remounts */}
          <div className={hasQuery ? 'py-5' : 'pb-16 md:pb-24'}>
            <SearchBar onSearch={handleSearch} loading={loading} />
            {hasQuery && !loading && (
              <p className="mt-2 text-white/30 text-xs tracking-wide" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                "{query}"
              </p>
            )}
            {!hasQuery && (
              <div className="mt-8 flex items-center gap-5">
                <Stat value="Registro" label="Oficial" />
                <div className="w-px h-6 bg-white/10" />
                <Stat value="45" label="Clases NICE" />
                <div className="w-px h-6 bg-white/10" />
                <Stat value="Fonética" label="Inteligente" />
              </div>
            )}
          </div>
        </div>

        {/* Bottom fade line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />
      </div>

      {/* ── Results area ─────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-10 py-6 md:py-8">

        {/* ── Filters ──────────────────────────────────────────────────── */}
        {hasQuery && (
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Status pills */}
              {STATUS_FILTERS.map(({ label, value }) => {
                const isActive = filters.status === value
                return (
                  <button
                    key={value}
                    onClick={() => applyFilter({ status: value })}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all"
                    style={isActive
                      ? { backgroundColor: NAVY, color: '#fff', borderColor: NAVY }
                      : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }}
                  >
                    {label}
                  </button>
                )
              })}

              {/* NICE class */}
              <NiceClassPicker
                value={filters.niceClass}
                onChange={v => applyFilter({ niceClass: v })}
              />

              {/* Advanced toggle */}
              <button
                onClick={() => setShowAdvanced(v => !v)}
                className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all"
                style={showAdvanced || advancedActive
                  ? { backgroundColor: GOLD, color: '#fff', borderColor: GOLD }
                  : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }}
              >
                <SlidersHorizontal size={11} />
                Avanzado
                {advancedActive && (
                  <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-bold">
                    {[filters.owner.trim(), filters.dateFrom, filters.dateTo].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Advanced panel */}
            {showAdvanced && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap items-end gap-4">
                {/* Owner text filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-gray-400">Titular</span>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all bg-white"
                    style={{ borderColor: filters.owner.trim() ? NAVY : '#E5E7EB', minWidth: '180px' }}>
                    <input
                      type="text"
                      value={filters.owner}
                      placeholder="Nombre del titular…"
                      onChange={e => applyFilter({ owner: e.target.value })}
                      className="flex-1 outline-none bg-transparent text-gray-700 placeholder:text-gray-400 text-xs"
                    />
                    {filters.owner && (
                      <button onClick={() => applyFilter({ owner: '' })}>
                        <X size={10} className="text-gray-300 hover:text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>

                <DateInput
                  label="Desde"
                  value={filters.dateFrom}
                  onChange={v => applyFilter({ dateFrom: v })}
                />
                <DateInput
                  label="Hasta"
                  value={filters.dateTo}
                  onChange={v => applyFilter({ dateTo: v })}
                />
              </div>
            )}

            {anyActive && (
              <div className="flex justify-end">
                <button onClick={clearAllFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={10} /> Quitar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Loading ───────────────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {!loading && hasQuery && results.length === 0 && (
          <div className="text-center py-20">
            <p
              className="text-6xl font-semibold mb-3"
              style={{ ...serif, color: !anyActive ? '#22c55e' : '#9CA3AF' }}
            >
              {!anyActive ? 'Disponible.' : 'Sin resultados.'}
            </p>
            <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
              {!anyActive
                ? <>No encontramos marcas similares a <strong className="text-gray-600">"{query}"</strong> en el registro.</>
                : <>Ninguna marca coincide con los filtros seleccionados.</>}
            </p>
            {anyActive && (
              <button onClick={clearAllFilters} className="mt-5 text-xs font-semibold underline underline-offset-2" style={{ color: NAVY }}>
                Quitar filtros
              </button>
            )}
            <p className="text-[11px] text-gray-300 mt-6">
              Esto no constituye asesoría legal. Consulta con un profesional.
            </p>
          </div>
        )}

        {/* ── Results ───────────────────────────────────────────────────── */}
        {!loading && results.length > 0 && (
          <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-medium text-gray-400">
                <span className="font-semibold text-gray-600">{results.length}{hasMore ? '+' : ''}</span> resultado{results.length !== 1 ? 's' : ''}
                {filters.status !== 'Todas' && <span className="ml-1">· {STATUS_FILTERS.find(f => f.value === filters.status)?.label}</span>}
                {filters.niceClass          && <span className="ml-1">· Clase {filters.niceClass}</span>}
                {filters.owner.trim()       && <span className="ml-1">· {filters.owner.trim()}</span>}
                {filters.dateFrom           && <span className="ml-1">· desde {filters.dateFrom}</span>}
                {filters.dateTo             && <span className="ml-1">· hasta {filters.dateTo}</span>}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={saveSearch}
                  disabled={savingSearch}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all hover:bg-gray-50 disabled:opacity-50"
                  style={{ color: NAVY, borderColor: '#E5E7EB' }}
                >
                  {user ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
                  Guardar
                </button>
                <button
                  onClick={() => exportSearchPdf({ query, results, activeFilters: filters })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all hover:bg-gray-50"
                  style={{ color: NAVY, borderColor: '#E5E7EB' }}
                >
                  <FileDown size={12} /> PDF
                </button>
              </div>
            </div>

            {results.map(r => (
              <ResultCard
                key={r.id}
                result={r}
                isBookmarked={bookmarkedIds.has(r.id)}
                onBookmarkToggle={toggleBookmark}
              />
            ))}

            {hasMore && (
              <div className="pt-4 pb-2 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-40 hover:bg-white"
                  style={{ color: NAVY, borderColor: '#D1D5DB' }}
                >
                  {loadingMore ? <><Loader2 size={14} className="animate-spin" /> Cargando…</> : 'Cargar más'}
                </button>
              </div>
            )}

            <p className="text-[11px] text-gray-300 text-center pt-2 pb-4">
              Esta búsqueda es orientativa y no reemplaza asesoría legal profesional.
            </p>
          </div>
        )}

        {/* Initial state */}
        {!hasQuery && !loading && (
          <div className="text-center py-16 text-gray-300">
            <ShieldCheck size={28} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm">Escribe al menos 3 caracteres para comenzar</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 mt-4">
        <a href="/login" className="text-[11px] text-gray-300 hover:text-gray-400 transition-colors">
          Admin
        </a>
      </footer>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-white text-base font-semibold leading-tight" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.15rem' }}>
        {value}
      </p>
      <p className="text-white/30 text-[10px] uppercase tracking-[0.18em] mt-0.5">{label}</p>
    </div>
  )
}

'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, ImageOff, Loader2, Search, X } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Trademark, TrademarkStatus } from '@/types/trademark'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

type StatusFilter = TrademarkStatus | 'Todos'
type PublishedFilter = 'Todos' | 'Publicado' | 'Borrador'

function getToken() {
  return document.cookie.split('; ').find(r => r.startsWith('admin_token='))?.split('=')[1] ?? ''
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [trademarks, setTrademarks] = useState<Trademark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos')
  const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>('Todos')

  useEffect(() => {
    fetch(`${API_BASE}/api/trademarks`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTrademarks(data)
        else setError('No se pudieron cargar las marcas.')
      })
      .catch(() => setError('Error al conectar con el servidor.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return trademarks.filter(tm => {
      if (q && !tm.nombre_marca.toLowerCase().includes(q) &&
          !tm.marca_denominativa.toLowerCase().includes(q) &&
          !tm.dueno.toLowerCase().includes(q)) return false
      if (statusFilter !== 'Todos' && tm.status !== statusFilter) return false
      if (publishedFilter === 'Publicado' && !tm.published) return false
      if (publishedFilter === 'Borrador' && tm.published) return false
      return true
    })
  }, [trademarks, search, statusFilter, publishedFilter])

  const hasFilters = search || statusFilter !== 'Todos' || publishedFilter !== 'Todos'

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('Todos')
    setPublishedFilter('Todos')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta marca?')) return
    await fetch(`${API_BASE}/api/trademarks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    setTrademarks(prev => prev.filter(t => t.id !== id))
  }

  const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Registrada', value: 'Registrada' },
    { label: 'En Trámite', value: 'En Tramite' },
    { label: 'Cancelada', value: 'Cancelada' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Marcas Registradas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Cargando...' : hasFilters
              ? `${filtered.length} de ${trademarks.length} marcas`
              : `${trademarks.length} marcas en total`}
          </p>
        </div>
        <Link
          href="/admin/nueva"
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-colors"
          style={{ backgroundColor: '#C8960C' }}
        >
          <Plus size={16} /> Nueva Marca
        </Link>
      </div>

      {/* Filter bar */}
      {!loading && !error && trademarks.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 space-y-3">
          {/* Search input */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-navy/10 focus-within:border-navy/40 transition-all">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, denominativa o dueño..."
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status + Published filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {STATUS_FILTERS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-semibold border transition-all',
                    statusFilter === value
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  )}
                  style={statusFilter === value ? { backgroundColor: '#1B2A4A' } : {}}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="w-px h-4 bg-gray-200 hidden sm:block" />

            {/* Published toggle */}
            <div className="flex items-center gap-1.5">
              {(['Todos', 'Publicado', 'Borrador'] as PublishedFilter[]).map(val => (
                <button
                  key={val}
                  onClick={() => setPublishedFilter(val)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-semibold border transition-all',
                    publishedFilter === val
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  )}
                  style={publishedFilter === val ? { backgroundColor: '#1B2A4A' } : {}}
                >
                  {val}
                </button>
              ))}
            </div>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <X size={12} /> Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Cargando marcas...</span>
          </div>
        )}

        {error && <div className="text-center py-16 text-sm text-red-500">{error}</div>}

        {!loading && !error && trademarks.length === 0 && (
          <div className="text-center py-16 text-sm text-gray-400">
            No hay marcas registradas aún.{' '}
            <Link href="/admin/nueva" className="text-navy font-medium hover:underline">Agregar la primera</Link>
          </div>
        )}

        {!loading && !error && trademarks.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-gray-500 mb-3">Ninguna marca coincide con los filtros aplicados.</p>
            <button onClick={clearFilters} className="text-xs font-semibold hover:underline" style={{ color: '#1B2A4A' }}>
              Limpiar filtros
            </button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Logo</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Denominativa</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Dueño</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Publicado</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tm, i) => (
                    <tr key={tm.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                      <td className="px-5 py-3.5">
                        {tm.marca_figurativa ? (
                          <img src={tm.marca_figurativa} alt={tm.nombre_marca} className="w-9 h-9 object-contain rounded-lg border border-gray-100" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center">
                            <ImageOff size={14} className="text-gray-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{tm.nombre_marca}</td>
                      <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{tm.marca_denominativa}</td>
                      <td className="px-5 py-3.5"><Badge status={tm.status} /></td>
                      <td className="px-5 py-3.5 text-gray-600">{tm.dueno}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${tm.published ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tm.published ? 'bg-green-500' : 'bg-gray-300'}`} />
                          {tm.published ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => router.push(`/admin/editar/${tm.id}`)} className="p-1.5 rounded-lg hover:bg-navy/10 text-gray-400 hover:text-navy transition-colors" title="Editar">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(tm.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
                            <Trash2 size={14} />
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
              {filtered.map(tm => (
                <div key={tm.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-10 h-10 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                    {tm.marca_figurativa
                      ? <img src={tm.marca_figurativa} alt={tm.nombre_marca} className="w-full h-full object-contain" />
                      : <ImageOff size={14} className="text-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{tm.nombre_marca}</p>
                    <p className="text-xs text-gray-500 truncate">{tm.dueno}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge status={tm.status} />
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${tm.published ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tm.published ? 'bg-green-500' : 'bg-gray-300'}`} />
                        {tm.published ? 'Publicado' : 'Borrador'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => router.push(`/admin/editar/${tm.id}`)} className="p-1.5 rounded-lg hover:bg-navy/10 text-gray-400 hover:text-navy transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(tm.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

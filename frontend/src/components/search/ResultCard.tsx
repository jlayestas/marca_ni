'use client'

import { useRouter } from 'next/navigation'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchResult } from '@/types/trademark'

const NAVY = '#1B2A4A'
const serif = { fontFamily: 'var(--font-cormorant)' } as React.CSSProperties
const mono  = { fontFamily: 'var(--font-geist-mono)' } as React.CSSProperties

interface SimilarityLevel {
  label: string
  barColor: string
  scoreColor: string
}

function getSimilarity(score: number): SimilarityLevel {
  if (score >= 0.9) return { label: 'Exacta',  barColor: '#ef4444', scoreColor: '#dc2626' }
  if (score >= 0.7) return { label: 'Alta',    barColor: '#f97316', scoreColor: '#ea580c' }
  if (score >= 0.5) return { label: 'Parcial', barColor: '#eab308', scoreColor: '#ca8a04' }
  return              { label: 'Mínima',  barColor: '#d1d5db', scoreColor: '#9ca3af' }
}

const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  Registrada:  { dot: '#22c55e', text: '#15803d', label: 'Registrada' },
  'En Tramite':{ dot: '#f59e0b', text: '#92400e', label: 'En Trámite' },
  Cancelada:   { dot: '#d1d5db', text: '#6b7280', label: 'Cancelada'  },
}

interface Props {
  result: SearchResult
  isBookmarked?: boolean
  onBookmarkToggle?: (id: string) => void
}

export default function ResultCard({ result, isBookmarked, onBookmarkToggle }: Props) {
  const router = useRouter()
  const sim   = getSimilarity(result.similarity_score)
  const score = Math.round(result.similarity_score * 100)
  const st    = STATUS_STYLES[result.status] ?? STATUS_STYLES.Cancelada

  return (
    <div className="group relative">
      <div
        onClick={() => router.push(`/marca/${result.id}`)}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden cursor-pointer"
      >
        {/* Similarity bar — 3 px, spans full width */}
        <div className="h-[3px] w-full" style={{ backgroundColor: '#F3F4F6' }}>
          <div
            className="h-full"
            style={{ width: `${result.similarity_score * 100}%`, backgroundColor: sim.barColor, transition: 'width 0.6s ease' }}
          />
        </div>

        <div className="px-5 py-4">
          <div className="flex items-start gap-4">
            {/* Left: logo (only when present) + name block */}
            <div className="flex-1 min-w-0 flex items-start gap-3">
              {result.marca_figurativa && (
                <img
                  src={result.marca_figurativa}
                  alt={result.nombre_marca}
                  className="w-10 h-10 object-contain rounded-xl border border-gray-100 bg-gray-50 shrink-0 mt-0.5"
                />
              )}
              <div className="min-w-0">
                <h3
                  className="text-[1.35rem] font-semibold leading-tight text-gray-900 group-hover:text-navy transition-colors truncate"
                  style={{ ...serif, color: '#111827' }}
                >
                  {result.nombre_marca}
                </h3>
                <p className="text-[11px] text-gray-400 truncate mt-0.5 tracking-wide" style={mono}>
                  {result.marca_denominativa}
                </p>
              </div>
            </div>

            {/* Right: score */}
            <div className="shrink-0 text-right pl-2">
              <p className="text-[2rem] font-semibold leading-none" style={{ ...serif, color: sim.scoreColor }}>
                {score}
                <span className="text-base font-normal" style={{ color: '#D1D5DB' }}>%</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.12em] mt-0.5" style={{ color: sim.scoreColor, opacity: 0.7 }}>
                {sim.label}
              </p>
            </div>
          </div>

          {/* Bottom data row */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400 flex-wrap">
            {/* Status dot */}
            <span className="flex items-center gap-1.5 shrink-0 font-medium" style={{ color: st.text }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: st.dot }} />
              {st.label}
            </span>

            <span className="text-gray-200">·</span>
            <span className="truncate">{result.dueno}</span>

            {result.nice_class && (
              <>
                <span className="text-gray-200 hidden sm:inline">·</span>
                <span className="hidden sm:inline shrink-0" style={mono}>
                  Clase {String(result.nice_class).padStart(2, '0')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bookmark button — appears on hover, stays visible when active */}
      {onBookmarkToggle && (
        <button
          onClick={e => { e.stopPropagation(); onBookmarkToggle(result.id) }}
          className={cn(
            'absolute top-4 right-4 p-1.5 rounded-lg transition-all duration-150',
            isBookmarked
              ? 'text-amber-500 bg-amber-50'
              : 'text-gray-200 hover:text-amber-400 hover:bg-amber-50 opacity-0 group-hover:opacity-100'
          )}
          title={isBookmarked ? 'Quitar de guardados' : 'Guardar marca'}
        >
          {isBookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
        </button>
      )}
    </div>
  )
}

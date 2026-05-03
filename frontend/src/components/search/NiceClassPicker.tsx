'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { NICE_CLASSES } from '@/lib/niceClasses'

const NAVY = '#1B2A4A'
const GOLD = '#C8960C'

interface Props {
  value: number | null
  onChange: (value: number | null) => void
}

export default function NiceClassPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = value ? NICE_CLASSES.find(c => c.number === value) : null
  const filtered = search.trim()
    ? NICE_CLASSES.filter(c =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        String(c.number).includes(search)
      )
    : NICE_CLASSES

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (num: number | null) => {
    onChange(num)
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap"
        style={selected
          ? { backgroundColor: NAVY, color: '#fff', borderColor: NAVY }
          : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }}
      >
        {selected
          ? <><span className="font-bold" style={{ color: GOLD }}>C{String(selected.number).padStart(2, '0')}</span> {selected.label.length > 22 ? selected.label.slice(0, 22) + '…' : selected.label}</>
          : 'Todas las clases'
        }
        {selected
          ? <X size={10} className="ml-0.5 opacity-60" onClick={e => { e.stopPropagation(); select(null) }} />
          : <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        }
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
          style={{ width: '280px' }}>

          {/* Search */}
          <div className="p-2 border-b border-gray-50">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
              <Search size={12} className="text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar clase…"
                className="flex-1 text-xs outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500">
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="overflow-y-auto" style={{ maxHeight: '240px' }}>
            {/* All classes option */}
            {!search && (
              <button
                onClick={() => select(null)}
                className="w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center gap-2.5"
                style={!value
                  ? { backgroundColor: `${NAVY}08`, color: NAVY, fontWeight: 600 }
                  : { color: '#6B7280' }}
              >
                <span className="w-7 text-center text-[10px] font-bold text-gray-300">—</span>
                Todas las clases
              </button>
            )}

            {filtered.length === 0 && (
              <p className="px-4 py-6 text-xs text-gray-400 text-center">Sin resultados</p>
            )}

            {filtered.map(c => {
              const isActive = value === c.number
              return (
                <button
                  key={c.number}
                  onClick={() => select(c.number)}
                  className="w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center gap-2.5 hover:bg-gray-50"
                  style={isActive ? { backgroundColor: `${NAVY}08` } : {}}
                >
                  <span
                    className="w-7 shrink-0 text-center text-[10px] font-bold rounded-md py-0.5"
                    style={isActive
                      ? { backgroundColor: NAVY, color: GOLD }
                      : { backgroundColor: '#F3F4F6', color: '#9CA3AF' }}
                  >
                    {String(c.number).padStart(2, '0')}
                  </span>
                  <span className="text-gray-700 leading-tight" style={isActive ? { color: NAVY, fontWeight: 600 } : {}}>
                    {c.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

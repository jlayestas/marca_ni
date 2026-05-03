'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'

const MIN_CHARS = 3

interface Props {
  onSearch: (query: string) => void
  loading?: boolean
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const meetsMinimum = query.trim().length >= MIN_CHARS

  const clear = () => {
    setQuery('')
    onSearch('')
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { onSearch(''); return }
    if (!meetsMinimum) return
    debounceRef.current = setTimeout(() => onSearch(query.trim()), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  return (
    <div className="w-full max-w-2xl space-y-2">
      <div
        className="flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-200"
        style={{
          border: `2px solid ${focused ? '#C8960C' : 'transparent'}`,
          boxShadow: focused
            ? '0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(200,150,12,0.2)'
            : '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <Search size={18} className="ml-5 shrink-0" style={{ color: focused ? '#C8960C' : '#9CA3AF' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Busca el nombre de tu marca..."
          className="flex-1 px-4 py-4 text-base outline-none text-gray-800 placeholder:text-gray-400 bg-transparent"
          autoFocus
        />
        {loading && <Loader2 size={16} className="mr-4 text-gray-300 animate-spin shrink-0" />}
        {query && !loading && (
          <button
            onClick={clear}
            className="mr-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {query.trim().length > 0 && !meetsMinimum && (
        <p className="text-white/50 text-xs text-center">
          Escribe al menos {MIN_CHARS} caracteres
          <span className="ml-1 text-white/30">({query.trim().length}/{MIN_CHARS})</span>
        </p>
      )}
    </div>
  )
}

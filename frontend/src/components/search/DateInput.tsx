'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { es } from 'react-day-picker/locale'

const NAVY = '#1B2A4A'
const GOLD = '#C8960C'

interface Props {
  label: string
  value: string
  onChange: (value: string) => void
}

export default function DateInput({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = value ? new Date(value + 'T00:00:00') : undefined

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (date: Date | undefined) => {
    if (!date) return
    const iso = date.toISOString().slice(0, 10)
    onChange(iso)
    setOpen(false)
  }

  return (
    <div ref={ref} className="flex flex-col gap-1 relative">
      <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-gray-400">{label}</span>

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all"
        style={value
          ? { backgroundColor: NAVY, color: '#fff', borderColor: NAVY }
          : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }}
      >
        <Calendar size={11} style={{ color: value ? GOLD : '#9CA3AF', flexShrink: 0 }} />
        <span>{value ? formatDate(value) : 'Seleccionar'}</span>
        {value && (
          <X
            size={10}
            className="ml-0.5 opacity-60 hover:opacity-100"
            onClick={e => { e.stopPropagation(); onChange('') }}
          />
        )}
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 z-50 bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)', minWidth: '280px' }}
        >
          <style>{calendarStyles}</style>
          <DayPicker
            mode="single"
            locale={es}
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected}
            components={{
              Chevron: ({ orientation }) =>
                orientation === 'left'
                  ? <ChevronLeft size={14} />
                  : <ChevronRight size={14} />,
            }}
            classNames={{
              root:        'rdp-root',
              months:      'rdp-months',
              month:       'rdp-month',
              month_caption:'rdp-caption',
              caption_label:'rdp-caption-label',
              nav:         'rdp-nav',
              button_previous: 'rdp-nav-btn',
              button_next: 'rdp-nav-btn',
              weekdays:    'rdp-head-row',
              weekday:     'rdp-head-cell',
              weeks:       'rdp-tbody',
              week:        'rdp-row',
              day:         'rdp-cell',
              day_button:  'rdp-day',
              selected:    'rdp-day--selected',
              today:       'rdp-day--today',
              outside:     'rdp-day--outside',
              disabled:    'rdp-day--disabled',
            }}
          />
        </div>
      )}
    </div>
  )
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${d} ${months[Number(m) - 1]} ${y}`
}

const calendarStyles = `
  .rdp-root { padding: 16px; font-family: var(--font-geist-sans); }

  .rdp-months { display: flex; flex-direction: column; gap: 0; }

  .rdp-caption {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .rdp-caption-label {
    font-size: 13px;
    font-weight: 600;
    color: ${NAVY};
    font-family: var(--font-cormorant);
    font-size: 16px;
    letter-spacing: 0.02em;
    text-transform: capitalize;
  }

  .rdp-nav {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .rdp-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid #E5E7EB;
    background: white;
    color: #6B7280;
    cursor: pointer;
    transition: all 0.15s;
  }
  .rdp-nav-btn:hover { background: ${NAVY}; color: white; border-color: ${NAVY}; }

  .rdp-head-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 4px;
  }

  .rdp-head-cell {
    text-align: center;
    font-size: 10px;
    font-weight: 600;
    color: #9CA3AF;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 0;
  }

  .rdp-tbody { display: flex; flex-direction: column; gap: 2px; }

  .rdp-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .rdp-cell {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rdp-day {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: none;
    background: transparent;
    font-size: 12px;
    color: #374151;
    cursor: pointer;
    transition: all 0.15s;
    font-weight: 400;
  }
  .rdp-day:hover:not(.rdp-day--selected):not(.rdp-day--disabled) {
    background: #F3F4F6;
    color: ${NAVY};
    font-weight: 600;
  }

  .rdp-day--selected {
    background: ${NAVY} !important;
    color: white !important;
    font-weight: 700 !important;
  }

  .rdp-day--today:not(.rdp-day--selected) {
    color: ${GOLD};
    font-weight: 700;
    position: relative;
  }
  .rdp-day--today:not(.rdp-day--selected)::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${GOLD};
  }

  .rdp-day--outside { color: #D1D5DB; }
  .rdp-day--disabled { color: #E5E7EB; cursor: not-allowed; }
`

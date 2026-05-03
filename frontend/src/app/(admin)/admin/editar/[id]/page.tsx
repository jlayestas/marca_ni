'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2 } from 'lucide-react'
import IntakeForm from '@/components/admin/IntakeForm'
import type { Trademark } from '@/types/trademark'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

function getToken() {
  return document.cookie.split('; ').find(r => r.startsWith('admin_token='))?.split('=')[1] ?? ''
}

export default function EditarMarcaPage() {
  const { id } = useParams<{ id: string }>()
  const [trademark, setTrademark] = useState<Trademark | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/trademarks/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then(data => { if (data) setTrademark(data) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-3">
          <ChevronLeft size={15} /> Volver al panel
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Editar Marca</h1>
        {trademark && (
          <p className="text-sm text-gray-500 mt-0.5">{trademark.nombre_marca}</p>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Cargando marca...</span>
        </div>
      )}

      {!loading && notFound && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-lg font-bold text-gray-800 mb-2">Marca no encontrada</p>
          <Link href="/admin" className="text-sm text-navy font-medium hover:underline">Volver al panel</Link>
        </div>
      )}

      {!loading && trademark && (
        <IntakeForm initialData={trademark} trademarkId={id} />
      )}
    </div>
  )
}

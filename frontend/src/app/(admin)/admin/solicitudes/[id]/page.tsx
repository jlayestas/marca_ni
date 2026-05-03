'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import IntakeForm from '@/components/admin/IntakeForm'
import type { Trademark } from '@/types/trademark'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

function getToken() {
  return document.cookie.split('; ').find(r => r.startsWith('admin_token='))?.split('=')[1] ?? ''
}

export default function EditSubmissionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [submission, setSubmission] = useState<Trademark | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/trademarks/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(data => setSubmission(data))
      .catch(() => setError('No se pudo cargar la solicitud.'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/admin/solicitudes')}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Editar y aprobar solicitud</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ajusta los datos antes de aprobar. Al guardar se aprueba y publica automáticamente.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Cargando solicitud...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-sm text-red-500">{error}</div>
      )}

      {!loading && !error && submission && (
        <IntakeForm
          initialData={submission}
          trademarkId={id}
          submissionMode
        />
      )}
    </div>
  )
}

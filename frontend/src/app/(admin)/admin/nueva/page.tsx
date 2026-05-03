import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import IntakeForm from '@/components/admin/IntakeForm'

export default function NuevaMarcaPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-3"
        >
          <ChevronLeft size={15} /> Volver al dashboard
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nueva Marca</h1>
        <p className="text-sm text-gray-500 mt-0.5">Completa los tres pasos para registrar una nueva marca.</p>
      </div>
      <IntakeForm />
    </div>
  )
}

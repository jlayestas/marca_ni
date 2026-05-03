import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { TrademarkStatus } from '@/types/trademark'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
  {
    variants: {
      status: {
        Registrada: 'bg-green-100 text-green-800 border border-green-200',
        'En Tramite': 'bg-amber-100 text-amber-800 border border-amber-200',
        Cancelada: 'bg-gray-100 text-gray-600 border border-gray-200',
      },
    },
    defaultVariants: {
      status: 'En Tramite',
    },
  }
)

const LABELS: Record<TrademarkStatus, string> = {
  Registrada: 'Registrada',
  'En Tramite': 'En Trámite',
  Cancelada: 'Cancelada',
}

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  status: TrademarkStatus
  className?: string
}

export default function Badge({ status, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ status }), className)}>
      {LABELS[status]}
    </span>
  )
}

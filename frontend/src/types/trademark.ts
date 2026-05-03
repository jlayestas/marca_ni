export type TrademarkStatus = 'Registrada' | 'En Tramite' | 'Cancelada'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface SocialLinks {
  instagram?: string
  facebook?: string
  tiktok?: string
  website?: string
}

export interface Trademark {
  id: string
  nombre_marca: string
  marca_figurativa?: string // image URL
  marca_denominativa: string
  status: TrademarkStatus
  nice_class: number | null
  dueno: string
  contactos: string[]
  redes_sociales: SocialLinks
  direccion: string
  published: boolean
  submitted_by: string | null
  approval_status: ApprovalStatus | null
  rejection_note: string | null
  created_at: string
  updated_at: string
}

export interface Submission extends Trademark {
  submitter_email?: string
  submitter_nombre?: string
}

export interface SearchResult extends Trademark {
  similarity_score: number
}

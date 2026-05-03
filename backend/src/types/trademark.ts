export type TrademarkStatus = 'Registrada' | 'En Tramite' | 'Cancelada'

export interface SocialLinks {
  instagram?: string
  facebook?: string
  tiktok?: string
  website?: string
}

export interface Trademark {
  id: string
  nombre_marca: string
  marca_figurativa?: string
  marca_denominativa: string
  status: TrademarkStatus
  nice_class: number | null
  dueno: string
  contactos: string[]
  redes_sociales: SocialLinks
  direccion: string
  published: boolean
  created_at: string
  updated_at: string
}

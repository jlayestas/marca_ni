import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

export interface UserPayload {
  id: string
  email: string
  nombre: string
  role: 'user'
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const header = req.headers['authorization']
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado' })
    return
  }
  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as UserPayload
    if (payload.role !== 'user') {
      res.status(403).json({ error: 'Acceso denegado' })
      return
    }
    ;(req as Request & { user: UserPayload }).user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

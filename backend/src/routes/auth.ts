import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'
const JWT_EXPIRES = '8h'

// Fallback hardcoded admin for initial setup (before DB is running)
// Password: Admin1234! — change via DB after first run
const FALLBACK_ADMIN = {
  email: 'admin@marcasni.com',
  hash: '$2b$10$EglkeeanlhayLVkRCBDiquhl878uknPMhcOXRUSpCkCtBouNx0A8G', // Admin1234!
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email y contraseña requeridos' })
    return
  }

  let hash: string | null = null

  // Try DB first, fall back to hardcoded admin
  try {
    const result = await pool.query('SELECT password_hash FROM admin_users WHERE email = $1', [email])
    if (result.rows.length > 0) {
      hash = result.rows[0].password_hash
    }
  } catch {
    // DB not available — use fallback
  }

  if (!hash && email === FALLBACK_ADMIN.email) {
    hash = FALLBACK_ADMIN.hash
  }

  if (!hash) {
    res.status(401).json({ error: 'Credenciales incorrectas' })
    return
  }

  const valid = await bcrypt.compare(password, hash)
  if (!valid) {
    res.status(401).json({ error: 'Credenciales incorrectas' })
    return
  }

  const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES })

  res.json({ token, email })
})

router.post('/logout', (_req, res) => {
  res.json({ success: true })
})

export default router

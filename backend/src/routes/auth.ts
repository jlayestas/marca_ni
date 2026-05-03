import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'
const JWT_EXPIRES = '8h'

router.post('/login', async (req, res) => {
  const email = req.body.email?.trim()
  const password = req.body.password?.trim()

  if (!email || !password) {
    res.status(400).json({ error: 'Email y contraseña requeridos' })
    return
  }

  try {
    const result = await pool.query('SELECT password_hash FROM admin_users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Credenciales incorrectas' })
      return
    }

    const valid = await bcrypt.compare(password, result.rows[0].password_hash)
    if (!valid) {
      res.status(401).json({ error: 'Credenciales incorrectas' })
      return
    }

    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
    res.json({ token, email })
  } catch (err) {
    console.error('[POST /api/auth/login]', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

router.post('/logout', (_req, res) => {
  res.json({ success: true })
})

export default router

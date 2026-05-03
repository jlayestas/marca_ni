import { Router, Request } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db'
import { requireUser, UserPayload } from '../middleware/userAuth'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'changeme'
const JWT_EXPIRES = '30d'

type AuthedRequest = Request & { user: UserPayload }

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body
  const nombre = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ')

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
    res.status(400).json({ error: 'Todos los campos son requeridos' })
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Correo electrónico inválido' })
    return
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })
    return
  }

  try {
    const existing = await pool.query('SELECT id FROM public_users WHERE email = $1', [email.toLowerCase()])
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Este correo ya está registrado' })
      return
    }

    const hash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO public_users (email, nombre, password_hash) VALUES ($1,$2,$3) RETURNING id, email, nombre',
      [email.toLowerCase(), nombre.trim(), hash]
    )
    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, email: user.email, nombre: user.nombre, role: 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
    res.status(201).json({ token, id: user.id, email: user.email, nombre: user.nombre })
  } catch {
    res.status(500).json({ error: 'Error al crear la cuenta' })
  }
})

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email?.trim() || !password) {
    res.status(400).json({ error: 'Correo y contraseña requeridos' })
    return
  }

  try {
    const result = await pool.query(
      'SELECT id, email, nombre, password_hash FROM public_users WHERE email = $1',
      [email.toLowerCase()]
    )
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Credenciales incorrectas' })
      return
    }
    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      res.status(401).json({ error: 'Credenciales incorrectas' })
      return
    }
    const token = jwt.sign({ id: user.id, email: user.email, nombre: user.nombre, role: 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
    res.json({ token, id: user.id, email: user.email, nombre: user.nombre })
  } catch {
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

// ── Me ────────────────────────────────────────────────────────────────────────
router.get('/me', requireUser, async (req, res) => {
  const { id, email, nombre } = (req as AuthedRequest).user
  res.json({ id, email, nombre })
})

// ── Saved Searches ────────────────────────────────────────────────────────────
router.get('/me/searches', requireUser, async (req, res) => {
  const { id } = (req as AuthedRequest).user
  try {
    const result = await pool.query(
      'SELECT id, query, filters, created_at FROM saved_searches WHERE user_id = $1 ORDER BY created_at DESC',
      [id]
    )
    res.json(result.rows)
  } catch {
    res.status(500).json({ error: 'Error al obtener búsquedas' })
  }
})

router.post('/me/searches', requireUser, async (req, res) => {
  const { id } = (req as AuthedRequest).user
  const { query, filters } = req.body

  if (!query?.trim()) {
    res.status(400).json({ error: 'La búsqueda no puede estar vacía' })
    return
  }

  try {
    const result = await pool.query(
      'INSERT INTO saved_searches (user_id, query, filters) VALUES ($1,$2,$3) RETURNING id, query, filters, created_at',
      [id, query.trim(), JSON.stringify(filters ?? {})]
    )
    res.status(201).json(result.rows[0])
  } catch {
    res.status(500).json({ error: 'Error al guardar la búsqueda' })
  }
})

router.delete('/me/searches/:searchId', requireUser, async (req, res) => {
  const { id } = (req as AuthedRequest).user
  try {
    await pool.query('DELETE FROM saved_searches WHERE id = $1 AND user_id = $2', [req.params.searchId, id])
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Error al eliminar la búsqueda' })
  }
})

// ── Bookmarks ─────────────────────────────────────────────────────────────────
router.get('/me/bookmarks', requireUser, async (req, res) => {
  const { id } = (req as AuthedRequest).user
  try {
    const result = await pool.query(
      `SELECT b.id AS bookmark_id, b.created_at AS bookmarked_at, t.*
       FROM bookmarks b
       JOIN trademarks t ON t.id = b.trademark_id
       WHERE b.user_id = $1 AND t.published = true
       ORDER BY b.created_at DESC`,
      [id]
    )
    res.json(result.rows)
  } catch {
    res.status(500).json({ error: 'Error al obtener marcadores' })
  }
})

router.post('/me/bookmarks', requireUser, async (req, res) => {
  const { id } = (req as AuthedRequest).user
  const { trademark_id } = req.body

  if (!trademark_id) {
    res.status(400).json({ error: 'trademark_id requerido' })
    return
  }

  try {
    const result = await pool.query(
      'INSERT INTO bookmarks (user_id, trademark_id) VALUES ($1,$2) ON CONFLICT (user_id, trademark_id) DO NOTHING RETURNING id',
      [id, trademark_id]
    )
    res.status(201).json({ success: true, created: result.rows.length > 0 })
  } catch {
    res.status(500).json({ error: 'Error al guardar marcador' })
  }
})

router.delete('/me/bookmarks/:trademarkId', requireUser, async (req, res) => {
  const { id } = (req as AuthedRequest).user
  try {
    await pool.query('DELETE FROM bookmarks WHERE user_id = $1 AND trademark_id = $2', [id, req.params.trademarkId])
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Error al eliminar marcador' })
  }
})

// ── Brand Submissions ─────────────────────────────────────────────────────────
router.post('/me/submit-brand', requireUser, async (req, res) => {
  const { id } = (req as AuthedRequest).user
  const {
    nombre_marca,
    marca_figurativa,
    marca_denominativa,
    status,
    nice_class,
    dueno,
    contactos,
    redes_sociales,
    direccion,
  } = req.body

  if (!nombre_marca?.trim() || !marca_denominativa?.trim() || !dueno?.trim()) {
    res.status(400).json({ error: 'Nombre, denominativa y dueño son requeridos' })
    return
  }

  try {
    const result = await pool.query(
      `INSERT INTO trademarks
         (nombre_marca, marca_figurativa, marca_denominativa, status, nice_class,
          dueno, contactos, redes_sociales, direccion, published, submitted_by, approval_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,false,$10,'pending')
       RETURNING *`,
      [
        nombre_marca.trim(),
        marca_figurativa ?? null,
        marca_denominativa.trim(),
        status ?? 'En Tramite',
        nice_class ?? null,
        dueno.trim(),
        JSON.stringify(contactos ?? []),
        JSON.stringify(redes_sociales ?? {}),
        direccion ?? null,
        id,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('[submit-brand]', err)
    res.status(500).json({ error: 'Error al enviar la solicitud' })
  }
})

// ── User's own submissions ────────────────────────────────────────────────────
router.get('/me/submissions', requireUser, async (req, res) => {
  const { id } = (req as AuthedRequest).user
  try {
    const result = await pool.query(
      `SELECT id, nombre_marca, marca_denominativa, dueno, approval_status, rejection_note, created_at
       FROM trademarks WHERE submitted_by = $1 ORDER BY created_at DESC`,
      [id]
    )
    res.json(result.rows)
  } catch {
    res.status(500).json({ error: 'Error al obtener solicitudes' })
  }
})

export default router

import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../db'
import { requireAdmin } from '../middleware/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'
const router = Router()

// Public: submit a brand for review (no auth required; links to account if token present)
router.post('/submit', async (req, res) => {
  const { nombre_marca, marca_figurativa, marca_denominativa, status, nice_class, dueno, contactos, redes_sociales, direccion } = req.body

  if (!nombre_marca?.trim() || !marca_denominativa?.trim() || !dueno?.trim()) {
    res.status(400).json({ error: 'Nombre, denominativa y dueño son requeridos' })
    return
  }

  let submittedBy: string | null = null
  const token = req.headers['authorization']?.split(' ')[1]
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: string; role: string }
      if (payload.role === 'user') submittedBy = payload.id
    } catch {}
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
        submittedBy,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('[submit-brand]', err)
    res.status(500).json({ error: 'Error al enviar la solicitud' })
  }
})

// Admin: get all (published + drafts, excludes pending/rejected submissions)
router.get('/', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM trademarks WHERE approval_status IS NULL OR approval_status = 'approved' ORDER BY created_at DESC"
    )
    res.json(result.rows)
  } catch (err) {
    console.error('[GET /api/trademarks]', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get by id — admin gets any, public gets published only
router.get('/:id', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]
  const isAdmin = !!token
  try {
    const result = await pool.query(
      `SELECT * FROM trademarks WHERE id = $1 ${isAdmin ? '' : 'AND published = true'}`,
      [req.params.id]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Admin: create
router.post('/', requireAdmin, async (req, res) => {
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
    published,
  } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO trademarks (nombre_marca, marca_figurativa, marca_denominativa, status, nice_class, dueno, contactos, redes_sociales, direccion, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        nombre_marca,
        marca_figurativa,
        marca_denominativa,
        status,
        nice_class ?? null,
        dueno,
        JSON.stringify(contactos),
        JSON.stringify(redes_sociales),
        direccion,
        published ?? false,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Create failed' })
  }
})

// Admin: update
router.patch('/:id', requireAdmin, async (req, res) => {
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
    published,
  } = req.body
  try {
    const result = await pool.query(
      `UPDATE trademarks SET
        nombre_marca = COALESCE($1, nombre_marca),
        marca_figurativa = COALESCE($2, marca_figurativa),
        marca_denominativa = COALESCE($3, marca_denominativa),
        status = COALESCE($4, status),
        nice_class = COALESCE($5, nice_class),
        dueno = COALESCE($6, dueno),
        contactos = COALESCE($7, contactos),
        redes_sociales = COALESCE($8, redes_sociales),
        direccion = COALESCE($9, direccion),
        published = COALESCE($10, published),
        updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [
        nombre_marca,
        marca_figurativa,
        marca_denominativa,
        status,
        nice_class ?? null,
        dueno,
        contactos ? JSON.stringify(contactos) : null,
        redes_sociales ? JSON.stringify(redes_sociales) : null,
        direccion,
        published,
        req.params.id,
      ]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Update failed' })
  }
})

// Admin: delete
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM trademarks WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' })
  }
})

export default router

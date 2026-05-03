import { Router } from 'express'
import { pool } from '../db'
import { requireAdmin } from '../middleware/auth'

const router = Router()

// Admin: list all pending submissions
router.get('/', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, pu.email AS submitter_email, pu.nombre AS submitter_nombre
      FROM trademarks t
      LEFT JOIN public_users pu ON pu.id = t.submitted_by
      WHERE t.approval_status = 'pending'
      ORDER BY t.created_at DESC
    `)
    res.json(result.rows)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Admin: get pending count (for sidebar badge)
router.get('/count', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*)::int AS count FROM trademarks WHERE approval_status = 'pending'"
    )
    res.json({ count: result.rows[0].count })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Admin: approve a submission
router.patch('/:id/approve', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE trademarks
       SET approval_status = 'approved', published = true, updated_at = NOW()
       WHERE id = $1 AND approval_status = 'pending'
       RETURNING *`,
      [req.params.id]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Solicitud no encontrada o ya procesada' })
      return
    }
    res.json(result.rows[0])
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Admin: edit fields and approve in one step
router.patch('/:id/edit-and-approve', requireAdmin, async (req, res) => {
  const {
    nombre_marca, marca_figurativa, marca_denominativa, status,
    nice_class, dueno, contactos, redes_sociales, direccion,
  } = req.body
  try {
    const result = await pool.query(
      `UPDATE trademarks SET
        nombre_marca      = COALESCE($1,  nombre_marca),
        marca_figurativa  = COALESCE($2,  marca_figurativa),
        marca_denominativa= COALESCE($3,  marca_denominativa),
        status            = COALESCE($4,  status),
        nice_class        = COALESCE($5,  nice_class),
        dueno             = COALESCE($6,  dueno),
        contactos         = COALESCE($7,  contactos),
        redes_sociales    = COALESCE($8,  redes_sociales),
        direccion         = COALESCE($9,  direccion),
        approval_status   = 'approved',
        published         = true,
        updated_at        = NOW()
       WHERE id = $10 AND approval_status = 'pending'
       RETURNING *`,
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
        req.params.id,
      ]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Solicitud no encontrada o ya procesada' })
      return
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('[edit-and-approve]', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Admin: reject a submission
router.patch('/:id/reject', requireAdmin, async (req, res) => {
  const { rejection_note } = req.body
  try {
    const result = await pool.query(
      `UPDATE trademarks
       SET approval_status = 'rejected', rejection_note = $1, updated_at = NOW()
       WHERE id = $2 AND approval_status = 'pending'
       RETURNING *`,
      [rejection_note ?? null, req.params.id]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Solicitud no encontrada o ya procesada' })
      return
    }
    res.json(result.rows[0])
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

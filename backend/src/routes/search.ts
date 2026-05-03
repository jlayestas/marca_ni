import { Router } from 'express'
import { pool } from '../db'
import { searchRateLimit } from '../middleware/rateLimit'
import { phoneticNormalize } from '../lib/phonetic'

const router = Router()

const PAGE_SIZE = 10

const VALID_STATUSES = ['Registrada', 'En Tramite', 'Cancelada']

// Normalize a string the same way phoneticNormalize does, but in SQL.
// We inline the replacements as a chain of regexp_replace calls so we don't
// need a custom Postgres function (avoids a migration).
function sqlPhonetic(col: string): string {
  const steps: [string, string][] = [
    ['PH', 'F'],
    ['QU', 'C'],
    ['GU([EI])', 'G\\1'],
    ['LL', 'Y'],
    ['CH', 'X'],
    ['RR', 'R'],
    ['TZ', 'S'],
    ['TS', 'S'],
    ['K', 'C'],
    ['W', 'V'],
    ['Z', 'S'],
    ['X([AEIOU])', 'S\\1'],
    ['Y([^AEIOU]|$)', 'I\\1'],
    ['V', 'B'],
    ['H', ''],
    ['Ñ', 'N'],
    ['Ü', 'U'],
  ]
  // Start with unaccent + upper
  let expr = `UPPER(unaccent(${col}))`
  for (const [pattern, replacement] of steps) {
    expr = `regexp_replace(${expr}, '${pattern}', '${replacement}', 'g')`
  }
  return expr
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

router.get('/', searchRateLimit, async (req, res) => {
  const q = ((req.query.q as string) || '').trim()
  const page = Math.max(0, parseInt(req.query.page as string) || 0)
  const offset = page * PAGE_SIZE
  const rawStatus = (req.query.status as string) || ''
  const status = VALID_STATUSES.includes(rawStatus) ? rawStatus : null
  const rawClass = parseInt(req.query.nice_class as string)
  const niceClass = rawClass >= 1 && rawClass <= 45 ? rawClass : null
  const owner = ((req.query.owner as string) || '').trim()
  const dateFrom = (req.query.date_from as string) || ''
  const dateTo = (req.query.date_to as string) || ''

  if (!q) {
    res.json({ results: [], hasMore: false, page: 0 })
    return
  }

  // Normalize query both ways: accent-stripped and phonetically collapsed.
  // We pass both to the DB so a single $1 param covers both similarity calls.
  const qNormalized = phoneticNormalize(q)

  try {
    const params: (string | number)[] = [qNormalized, PAGE_SIZE + 1, offset]
    let statusClause = ''
    let classClause = ''
    let ownerClause = ''
    let dateFromClause = ''
    let dateToClause = ''
    if (status) {
      params.push(status)
      statusClause = `AND status = $${params.length}::trademark_status`
    }
    if (niceClass) {
      params.push(niceClass)
      classClause = `AND nice_class = $${params.length}`
    }
    if (owner) {
      params.push(`%${owner}%`)
      ownerClause = `AND dueno ILIKE $${params.length}`
    }
    if (dateFrom && DATE_RE.test(dateFrom)) {
      params.push(dateFrom)
      dateFromClause = `AND created_at >= $${params.length}::date`
    }
    if (dateTo && DATE_RE.test(dateTo)) {
      params.push(dateTo)
      dateToClause = `AND created_at < ($${params.length}::date + INTERVAL '1 day')`
    }

    const nombrePhonetic = sqlPhonetic('nombre_marca')
    const denominativaPhonetic = sqlPhonetic('marca_denominativa')

    const result = await pool.query(
      `SELECT *,
        GREATEST(
          similarity(${nombrePhonetic}, $1),
          similarity(${denominativaPhonetic}, $1)
        ) AS similarity_score
       FROM trademarks
       WHERE published = true
         ${statusClause}
         ${classClause}
         ${ownerClause}
         ${dateFromClause}
         ${dateToClause}
         AND (
           similarity(${nombrePhonetic}, $1) > 0.2
           OR similarity(${denominativaPhonetic}, $1) > 0.2
         )
       ORDER BY similarity_score DESC
       LIMIT $2 OFFSET $3`,
      params
    )

    const hasMore = result.rows.length > PAGE_SIZE
    const rows = result.rows.slice(0, PAGE_SIZE)

    res.json({ results: rows, hasMore, page })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Search failed' })
  }
})

export default router

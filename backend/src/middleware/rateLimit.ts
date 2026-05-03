import { Request, Response, NextFunction } from 'express'

interface Bucket {
  count: number
  resetAt: number
}

const WINDOW_MS = 60_000
const MAX_REQUESTS = 60

const store = new Map<string, Bucket>()

// Purge stale entries every 5 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of store) {
    if (bucket.resetAt < now) store.delete(key)
  }
}, 5 * 60_000)

function getIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  return req.socket.remoteAddress ?? 'unknown'
}

export function searchRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = getIp(req)
  const now = Date.now()

  let bucket = store.get(ip)
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + WINDOW_MS }
    store.set(ip, bucket)
  }

  bucket.count++

  const remaining = Math.max(0, MAX_REQUESTS - bucket.count)
  const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS)
  res.setHeader('X-RateLimit-Remaining', remaining)
  res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetAt / 1000))

  if (bucket.count > MAX_REQUESTS) {
    res.setHeader('Retry-After', retryAfter)
    res.status(429).json({ error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' })
    return
  }

  next()
}

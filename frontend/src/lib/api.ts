const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function searchTrademarks(query: string) {
  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}

export async function getTrademarkById(id: string) {
  const res = await fetch(`${API_BASE}/api/trademarks/${id}`)
  if (!res.ok) throw new Error('Not found')
  return res.json()
}

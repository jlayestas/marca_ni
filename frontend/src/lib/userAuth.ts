const SESSION_KEY = 'marcasni_user'

export interface UserSession {
  token: string
  id: string
  email: string
  nombre: string
}

export function getSession(): UserSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setSession(session: UserSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function getUserToken(): string | null {
  return getSession()?.token ?? null
}

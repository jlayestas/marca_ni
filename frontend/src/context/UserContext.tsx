'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getSession, setSession, clearSession, UserSession } from '@/lib/userAuth'

interface UserContextValue {
  user: UserSession | null
  login: (session: UserSession) => void
  logout: () => void
  loading: boolean
}

const UserContext = createContext<UserContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(getSession())
    setLoading(false)
  }, [])

  const login = (session: UserSession) => {
    setSession(session)
    setUser(session)
  }

  const logout = () => {
    clearSession()
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ADMIN_UNAUTHORIZED_EVENT,
  adminLogin,
  adminLogout,
  adminMe,
} from '../lib/api'
import type { AdminUser } from '../types'

type AuthContextValue = {
  user: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearSession: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    adminMe()
      .then((current) => {
        if (active) setUser(current)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const handler = () => setUser(null)
    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, handler)
    return () => window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, handler)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const current = await adminLogin(email, password)
    setUser(current)
  }, [])

  const logout = useCallback(async () => {
    try {
      await adminLogout()
    } catch {
      // Sesi tetap dibersihkan di klien meskipun permintaan gagal.
    }
    setUser(null)
  }, [])

  const clearSession = useCallback(() => setUser(null), [])

  const value = useMemo(
    () => ({ user, loading, login, logout, clearSession }),
    [user, loading, login, logout, clearSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return context
}

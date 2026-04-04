import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as api from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  const isAdmin = user?.role === 'ADMIN'

  const persist = useCallback((nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    if (nextToken) localStorage.setItem('token', nextToken)
    else localStorage.removeItem('token')
    if (nextUser) localStorage.setItem('user', JSON.stringify(nextUser))
    else localStorage.removeItem('user')
  }, [])

  const login = useCallback(
    async (phone, password, { asAdmin = false } = {}) => {
      const data = await api.auth.login({ phone, password })
      if (asAdmin && data.user?.role !== 'ADMIN') {
        throw new Error('This account is not an admin.')
      }
      if (!asAdmin && data.user?.role === 'ADMIN') {
        throw new Error('Use admin login for admin accounts.')
      }
      persist(data.token, data.user)
      navigate(data.user?.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true })
      return data
    },
    [navigate, persist]
  )

  const register = useCallback(
    async (payload) => {
      const data = await api.auth.register(payload)
      persist(data.token, data.user)
      navigate('/dashboard', { replace: true })
      return data
    },
    [navigate, persist]
  )

  const logout = useCallback(() => {
    persist(null, null)
    navigate('/login', { replace: true })
  }, [navigate, persist])

  useEffect(() => {
    if (token && user && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true })
    }
  }, [token, user, location.pathname, navigate])

  const value = useMemo(
    () => ({
      user,
      token,
      isAdmin,
      login,
      register,
      logout,
      persist,
    }),
    [user, token, isAdmin, login, register, logout, persist]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}

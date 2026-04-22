import React, { createContext, useState, useEffect } from 'react'
import { getCurrentUser, setCurrentUser, logout as authLogout } from '../utils/auth'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUserState] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load current user from localStorage on mount
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setCurrentUserState(user)
    }
    setIsLoading(false)
  }, [])

  const login = (username) => {
    setCurrentUser(username)
    setCurrentUserState(username)
  }

  const logout = () => {
    authLogout()
    setCurrentUserState(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

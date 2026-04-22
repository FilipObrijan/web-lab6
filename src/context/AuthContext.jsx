import React, { createContext, useState, useEffect } from 'react'
import { logout as authLogout, observeAuthState } from '../utils/auth'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUserState] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Subscribe to Firebase authentication state
  useEffect(() => {
    let unsubscribe = () => {}

    try {
      unsubscribe = observeAuthState((user) => {
        setCurrentUserState(user)
        setIsLoading(false)
      })
    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }

    return () => unsubscribe()
  }, [])

  const login = (user) => {
    setCurrentUserState(user)
  }

  const logout = async () => {
    await authLogout()
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

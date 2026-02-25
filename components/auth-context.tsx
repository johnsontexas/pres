"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"

const ADMIN_PASSWORD = "strakeadmin2026"
const USER_KEY = "campaign-user"

export type User = {
  id: string
  name: string
  isAdmin: boolean
}

type AuthContextType = {
  user: User | null
  signIn: (name: string, adminPassword?: string) => boolean
  signOut: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: () => false,
  signOut: () => {},
  isLoading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch {
      // ignore parse errors
    }
    setIsLoading(false)
  }, [])

  const signIn = useCallback((name: string, adminPassword?: string) => {
    const isAdmin = adminPassword === ADMIN_PASSWORD
    if (adminPassword && !isAdmin) {
      return false // wrong admin password
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      isAdmin,
    }

    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setUser(newUser)
    return true
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

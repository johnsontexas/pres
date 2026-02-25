"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

export type User = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  isAdmin: boolean
}

// Admin emails - add yours here
const ADMIN_EMAILS = ["dajohnson27@mail.strakejesuit.org"]

function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  const email = supabaseUser.email || ""
  const meta = supabaseUser.user_metadata || {}
  return {
    id: supabaseUser.id,
    name: meta.full_name || meta.name || email.split("@")[0],
    email,
    avatarUrl: meta.avatar_url || null,
    isAdmin: ADMIN_EMAILS.includes(email),
  }
}

type AuthContextType = {
  user: User | null
  signOut: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signOut: async () => {},
  isLoading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user: supabaseUser } }) => {
      if (supabaseUser) {
        setUser(mapSupabaseUser(supabaseUser))
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user))
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

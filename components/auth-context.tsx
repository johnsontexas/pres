"use client"

import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react"
import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export type User = {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

type AuthContextType = {
  user: User | null
  signInWithGoogle: (callbackUrl?: string) => Promise<void>
  signOut: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  isLoading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

function mapSupabaseUser(sbUser: SupabaseUser | null): User | null {
  if (!sbUser) return null
  const email = (sbUser.email ?? "").toLowerCase()
  return {
    id: sbUser.id,
    email,
    name:
      sbUser.user_metadata?.full_name ??
      sbUser.user_metadata?.name ??
      email.split("@")[0] ??
      "User",
    isAdmin: ADMIN_EMAILS.includes(email),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUser(session?.user ?? null))
      setIsLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapSupabaseUser(session?.user ?? null))
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const syncedAdmin = useRef(false)
  useEffect(() => {
    if (!user?.isAdmin || syncedAdmin.current) return
    syncedAdmin.current = true
    fetch("/api/sync-admin", { method: "POST" }).catch(() => {})
  }, [user?.isAdmin])

  const signInWithGoogle = useCallback(
    async (callbackUrl = "/questions") => {
      const { data } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackUrl)}`,
        },
      })
      if (data.url) {
        window.location.href = data.url
      }
    },
    [supabase]
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

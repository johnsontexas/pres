"use client"

import { createContext, useContext } from "react"
import type { ReactNode } from "react"
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react"

export type User = {
  id: string
  name: string
  isAdmin: boolean
}

type AuthContextType = {
  user: User | null
  signInWithGoogle: (callbackUrl?: string) => void
  signOut: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signInWithGoogle: () => { /* noop */ },
  signOut: () => {},
  isLoading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  const user: User | null = session?.user
    ? {
        id: session.user.id ?? session.user.email ?? "",
        name: session.user.name ?? session.user.email ?? "User",
        isAdmin: session.user.email ? ADMIN_EMAILS.includes(session.user.email) : false,
      }
    : null

  const signInWithGoogle = (callbackUrl = "/questions") => {
    nextAuthSignIn("google", { callbackUrl })
  }

  const signOut = () => {
    nextAuthSignOut({ callbackUrl: "/" })
  }

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

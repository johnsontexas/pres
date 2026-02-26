"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { Suspense } from "react"

function SignInForm() {
  const { user, signInWithGoogle, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("callbackUrl") ?? searchParams.get("redirect") ?? "/questions"
  const error = searchParams.get("error")

  // Already signed in
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Signed in as {user.name}
          </h2>
          {user.isAdmin && (
            <span className="mt-1 inline-block rounded-full bg-accent/20 px-3 py-0.5 text-xs font-medium text-accent-foreground">
              Admin
            </span>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={typeof redirect === "string" ? redirect : "/questions"}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Continue
            </Link>
            <button
              onClick={() => signOut()}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaign
        </Link>

        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <h1 className="font-serif text-2xl font-bold text-foreground">Sign In</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with your Strake Jesuit email to ask questions and vote.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => signInWithGoogle(typeof redirect === "string" ? redirect : undefined)}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-input bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
            {error === "invalid_domain" && (
              <p className="text-center text-sm text-destructive">
                Only @mail.strakejesuit.org accounts are accepted.
              </p>
            )}
            {error === "auth_failed" && (
              <p className="text-center text-sm text-destructive">
                Sign-in failed. Please try again.
              </p>
            )}
            {error === "rate_limited" && (
              <p className="text-center text-sm text-destructive">
                Too many sign-in attempts. Please wait a few seconds and try again.
              </p>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Only @mail.strakejesuit.org accounts are accepted
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  )
}

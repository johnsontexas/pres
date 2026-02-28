import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_DOMAIN = "mail.strakejesuit.org"
const MIN_AUTH_INTERVAL_MS = 10_000
const AUTH_COOKIE_NAME = "auth_last"

function getCookie(request: Request, name: string): string | null {
  const raw = request.headers.get("cookie")
  if (!raw) return null

  const parts = raw.split(";")
  for (const part of parts) {
    const [key, ...rest] = part.trim().split("=")
    if (key === name) {
      return decodeURIComponent(rest.join("="))
    }
  }
  return null
}

function redirectWithAuthCookie(url: string, now: number) {
  const response = NextResponse.redirect(url)
  response.cookies.set(AUTH_COOKIE_NAME, String(now), {
    httpOnly: true,
    secure: true,
    path: "/",
  })
  return response
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/questions"
  const safeNext = next.startsWith("/") ? next : "/questions"
  const now = Date.now()

  // Basic rate limiting per browser to prevent runaway loops from
  // repeatedly calling exchangeCodeForSession.
  const lastAuthRaw = getCookie(request, AUTH_COOKIE_NAME)
  const lastAuth = lastAuthRaw ? Number(lastAuthRaw) : NaN
  if (Number.isFinite(lastAuth) && now - lastAuth < MIN_AUTH_INTERVAL_MS) {
    return redirectWithAuthCookie(`${origin}/signin?error=rate_limited`, now)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Restrict to @mail.strakejesuit.org
      const email = data.user.email
      if (email) {
        const domain = email.split("@")[1]
        if (domain !== ALLOWED_DOMAIN) {
          await supabase.auth.signOut()
          return redirectWithAuthCookie(`${origin}/signin?error=invalid_domain`, now)
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocal = process.env.NODE_ENV === "development"
      if (isLocal) {
        return redirectWithAuthCookie(`${origin}${safeNext}`, now)
      }
      if (forwardedHost) {
        return redirectWithAuthCookie(`https://${forwardedHost}${safeNext}`, now)
      }
      return redirectWithAuthCookie(`${origin}${safeNext}`, now)
    }
  }

  return redirectWithAuthCookie(`${origin}/signin?error=auth_failed`, now)
}

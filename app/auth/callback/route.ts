import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_DOMAIN = "mail.strakejesuit.org"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/questions"
  const safeNext = next.startsWith("/") ? next : "/questions"

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
          return NextResponse.redirect(`${origin}/signin?error=invalid_domain`)
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocal = process.env.NODE_ENV === "development"
      if (isLocal) {
        return NextResponse.redirect(`${origin}${safeNext}`)
      }
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${safeNext}`)
      }
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth_failed`)
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_DOMAINS = ["mail.strakejesuit.org", "strakejesuit.org"]

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const redirect = searchParams.get("redirect") || "/questions"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Verify domain restriction
      const email = data.user.email || ""
      const domain = email.split("@")[1] || ""

      if (!ALLOWED_DOMAINS.includes(domain)) {
        // Sign out user with invalid domain
        await supabase.auth.signOut()
        return NextResponse.redirect(
          `${origin}/signin?error=invalid_domain`
        )
      }

      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  // If something went wrong, redirect to sign in with error
  return NextResponse.redirect(`${origin}/signin?error=auth_error`)
}

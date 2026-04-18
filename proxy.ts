import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"

const PUBLIC_FILE = /\.(.*)$/

async function getShutdown() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { enabled: false }

  const response = await fetch(
    `${url}/rest/v1/app_settings?key=eq.site_shutdown&select=value`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: "no-store",
    }
  ).catch(() => null)

  if (!response?.ok) return { enabled: false }
  const rows = (await response.json().catch(() => [])) as { value?: { enabled?: boolean } }[]
  return { enabled: Boolean(rows[0]?.value?.enabled) }
}

async function isAdmin(email: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return false

  const cleanEmail = email.toLowerCase()
  const query = encodeURIComponent(`email.eq.${cleanEmail}`)
  const [adminResponse, superResponse] = await Promise.all([
    fetch(`${url}/rest/v1/admin_emails?or=(${query})&select=email`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    }).catch(() => null),
    fetch(`${url}/rest/v1/super_admin_emails?or=(${query})&select=email`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    }).catch(() => null),
  ])

  const admins = adminResponse?.ok ? await adminResponse.json().catch(() => []) : []
  const supers = superResponse?.ok ? await superResponse.json().catch(() => []) : []
  return admins.length > 0 || supers.length > 0
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname === "/shutdown" ||
    pathname === "/signin" ||
    pathname.startsWith("/auth") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  const shutdown = await getShutdown()
  if (!shutdown.enabled) return NextResponse.next()

  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: Partial<ResponseCookie> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.email && (await isAdmin(user.email))) {
    return response
  }

  return NextResponse.redirect(new URL("/shutdown", request.url))
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}

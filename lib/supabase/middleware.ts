import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_DOMAINS = ['mail.strakejesuit.org', 'strakejesuit.org']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, check domain restriction
  if (user) {
    const email = user.email || ''
    const domain = email.split('@')[1] || ''
    if (!ALLOWED_DOMAINS.includes(domain)) {
      // Sign out the user and redirect to error
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/signin'
      url.searchParams.set('error', 'invalid_domain')
      return NextResponse.redirect(url)
    }
  }

  // Protect the /questions/ask route - require sign in
  if (
    request.nextUrl.pathname.startsWith('/questions/ask') &&
    !user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    url.searchParams.set('redirect', '/questions/ask')
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

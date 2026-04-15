import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

async function getSignedInUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return { error: "Not signed in", status: 401 as const }
  }

  return { user, email: user.email.toLowerCase() }
}

async function requireAdmin() {
  const auth = await getSignedInUser()
  if ("error" in auth) return auth

  const admin = createAdminClient()
  if (ADMIN_EMAILS.includes(auth.email)) {
    await admin.from("admin_emails").upsert({ email: auth.email }, { onConflict: "email" })
    return auth
  }

  const { data } = await admin
    .from("admin_emails")
    .select("email")
    .eq("email", auth.email)
    .maybeSingle()

  if (!data) {
    return { error: "Not an admin", status: 403 as const }
  }

  return auth
}

function cleanLinks(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      const link = item as { label?: unknown; url?: unknown }
      const label = String(link.label ?? "").trim()
      const url = String(link.url ?? "").trim()
      if (!label || !url) return null
      try {
        const parsed = new URL(url)
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
        return { label, url }
      } catch {
        return null
      }
    })
    .filter(Boolean)
    .slice(0, 5)
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if ("error" in auth) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("news_posts")
      .insert({
        title: String(body.title ?? "").trim(),
        excerpt: String(body.excerpt ?? "").trim(),
        content: String(body.content ?? "").trim(),
        author: String(body.author ?? auth.user.user_metadata?.name ?? "Admin"),
        author_id: auth.user.id,
        published_at: String(body.publishedAt ?? new Date().toISOString()),
        is_published: Boolean(body.isPublished),
        image_url: body.imageUrl ? String(body.imageUrl).trim() : null,
        slug: String(body.slug ?? "").trim(),
        links: cleanLinks(body.links),
      })
      .select("*")
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, post: data })
  } catch (err) {
    console.error("news create error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not create post" },
      { status: 500 }
    )
  }
}

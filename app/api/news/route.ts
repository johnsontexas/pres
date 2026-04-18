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

function isMissingColumnError(error: unknown, column: string) {
  const message = errorMessage(error)
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : ""

  return code === "42703" || message.toLowerCase().includes(`'${column}' column`) || message.toLowerCase().includes(`column ${column}`)
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error) {
    const details = error as {
      message?: unknown
      details?: unknown
      hint?: unknown
      code?: unknown
    }
    return [
      details.message,
      details.details,
      details.hint ? `Hint: ${details.hint}` : null,
      details.code ? `Code: ${details.code}` : null,
    ]
      .filter(Boolean)
      .map(String)
      .join(" ")
  }
  return String(error || "Could not create post")
}

function publicNewsError(error: unknown) {
  const message = errorMessage(error)
  if (message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
    return "SUPABASE_SERVICE_ROLE_KEY is not set in Netlify. Add it, then redeploy."
  }
  if (isMissingColumnError(error, "links")) {
    return "The news links column is missing in Supabase. Run the latest news SQL, then try again."
  }
  return message
}

async function uniqueSlug(admin: ReturnType<typeof createAdminClient>, baseSlug: string) {
  const fallback = baseSlug || `news-${Date.now()}`
  let nextSlug = fallback
  let suffix = 2

  while (suffix < 100) {
    const { data, error } = await admin
      .from("news_posts")
      .select("id")
      .eq("slug", nextSlug)
      .maybeSingle()

    if (error) throw error
    if (!data) return nextSlug

    nextSlug = `${fallback}-${suffix}`
    suffix += 1
  }

  return `${fallback}-${Date.now()}`
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if ("error" in auth) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const admin = createAdminClient()
    const title = String(body.title ?? "").trim()
    const excerpt = String(body.excerpt ?? "").trim()
    const content = String(body.content ?? "").trim()
    const imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null
    const imageFit = body.imageFit === "cover" ? "cover" : "contain"
    const imagePositionX = Math.min(100, Math.max(0, Number(body.imagePositionX ?? 50)))
    const imagePositionY = Math.min(100, Math.max(0, Number(body.imagePositionY ?? 50)))

    if (!title || !content) {
      return NextResponse.json(
        { ok: false, error: "Title and content are required." },
        { status: 400 }
      )
    }

    const slug = await uniqueSlug(admin, String(body.slug ?? "").trim())
    const postPayload: Record<string, unknown> = {
      title,
      excerpt,
      caption: excerpt,
      content,
      author: String(body.author ?? auth.user.user_metadata?.name ?? "Admin"),
      author_name: String(body.author ?? auth.user.user_metadata?.name ?? "Admin"),
      author_id: auth.user.id,
      published_at: String(body.publishedAt ?? new Date().toISOString()),
      is_published: Boolean(body.isPublished),
      image_url: imageUrl,
      image_fit: imageFit,
      image_position_x: imagePositionX,
      image_position_y: imagePositionY,
      media_url: imageUrl ?? "",
      media_type: "image",
      slug,
      links: cleanLinks(body.links),
    }

    let { data, error } = await admin
      .from("news_posts")
      .insert(postPayload)
      .select("*")
      .single()

    if (error && isMissingColumnError(error, "links")) {
      delete postPayload.links
      const retry = await admin
        .from("news_posts")
        .insert(postPayload)
        .select("*")
        .single()

      data = retry.data
      error = retry.error
    }

    if (error && isMissingColumnError(error, "caption")) {
      delete postPayload.caption
      const retry = await admin
        .from("news_posts")
        .insert(postPayload)
        .select("*")
        .single()

      data = retry.data
      error = retry.error
    }

    if (error && isMissingColumnError(error, "author_name")) {
      delete postPayload.author_name
      const retry = await admin
        .from("news_posts")
        .insert(postPayload)
        .select("*")
        .single()

      data = retry.data
      error = retry.error
    }

    if (error && isMissingColumnError(error, "media_url")) {
      delete postPayload.media_url
      delete postPayload.media_type
      const retry = await admin
        .from("news_posts")
        .insert(postPayload)
        .select("*")
        .single()

      data = retry.data
      error = retry.error
    }

    if (error && isMissingColumnError(error, "image_fit")) {
      delete postPayload.image_fit
      delete postPayload.image_position_x
      delete postPayload.image_position_y
      const retry = await admin
        .from("news_posts")
        .insert(postPayload)
        .select("*")
        .single()

      data = retry.data
      error = retry.error
    }

    if (error) throw error

    return NextResponse.json({ ok: true, post: data })
  } catch (err) {
    console.error("news create error:", err)
    return NextResponse.json(
      { ok: false, error: publicNewsError(err) },
      { status: 500 }
    )
  }
}

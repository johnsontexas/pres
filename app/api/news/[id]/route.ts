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

  if (!data) return { error: "Not an admin", status: 403 as const }
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
  const message = errorMessage(error, "Database error")
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : ""

  return code === "42703" || message.toLowerCase().includes(`'${column}' column`) || message.toLowerCase().includes(`column ${column}`)
}

function errorMessage(error: unknown, fallback: string) {
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
  return String(error || fallback)
}

function publicNewsError(error: unknown, fallback: string) {
  const message = errorMessage(error, fallback)
  if (message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
    return "SUPABASE_SERVICE_ROLE_KEY is not set in Netlify. Add it, then redeploy."
  }
  if (isMissingColumnError(error, "links")) {
    return "The news links column is missing in Supabase. Run the latest news SQL, then try again."
  }
  if (isMissingColumnError(error, "likes")) {
    return "The news likes column is missing in Supabase. Run the latest news SQL, then try again."
  }
  return message
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (body.action === "toggle-like") {
      const auth = await getSignedInUser()
      if ("error" in auth) {
        return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
      }

      const admin = createAdminClient()
      const { data: post, error: loadError } = await admin
        .from("news_posts")
        .select("likes")
        .eq("id", id)
        .single()

      if (loadError) throw loadError

      const likes = ((post.likes as string[] | null) ?? [])
      const nextLikes = likes.includes(auth.user.id)
        ? likes.filter((userId) => userId !== auth.user.id)
        : [...likes, auth.user.id]

      const { data, error } = await admin
        .from("news_posts")
        .update({ likes: nextLikes })
        .eq("id", id)
        .select("*")
        .single()

      if (error) throw error
      return NextResponse.json({ ok: true, post: data })
    }

    const auth = await requireAdmin()
    if ("error" in auth) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.title !== undefined) updates.title = String(body.title).trim()
    if (body.excerpt !== undefined) {
      updates.excerpt = String(body.excerpt).trim()
      updates.caption = String(body.excerpt).trim()
    }
    if (body.content !== undefined) updates.content = String(body.content).trim()
    if (body.publishedAt !== undefined) updates.published_at = String(body.publishedAt)
    if (body.isPublished !== undefined) updates.is_published = Boolean(body.isPublished)
    if (body.imageUrl !== undefined) {
      const imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null
      updates.image_url = imageUrl
      updates.media_url = imageUrl ?? ""
      updates.media_type = "image"
    }
    if (body.imageFit !== undefined) updates.image_fit = body.imageFit === "cover" ? "cover" : "contain"
    if (body.imagePositionX !== undefined) {
      updates.image_position_x = Math.min(100, Math.max(0, Number(body.imagePositionX)))
    }
    if (body.imagePositionY !== undefined) {
      updates.image_position_y = Math.min(100, Math.max(0, Number(body.imagePositionY)))
    }
    if (body.slug !== undefined) updates.slug = String(body.slug).trim()
    if (body.links !== undefined) updates.links = cleanLinks(body.links)

    const admin = createAdminClient()
    let { data, error } = await admin
      .from("news_posts")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single()

    if (error && isMissingColumnError(error, "links") && "links" in updates) {
      delete updates.links
      const retry = await admin
        .from("news_posts")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single()

      data = retry.data
      error = retry.error
    }

    if (error && isMissingColumnError(error, "caption") && "caption" in updates) {
      delete updates.caption
      const retry = await admin
        .from("news_posts")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single()

      data = retry.data
      error = retry.error
    }

    if (error && isMissingColumnError(error, "media_url") && "media_url" in updates) {
      delete updates.media_url
      delete updates.media_type
      const retry = await admin
        .from("news_posts")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single()

      data = retry.data
      error = retry.error
    }

    if (error && isMissingColumnError(error, "image_fit") && "image_fit" in updates) {
      delete updates.image_fit
      delete updates.image_position_x
      delete updates.image_position_y
      const retry = await admin
        .from("news_posts")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single()

      data = retry.data
      error = retry.error
    }

    if (error) throw error
    return NextResponse.json({ ok: true, post: data })
  } catch (err) {
    console.error("news update error:", err)
    return NextResponse.json(
      { ok: false, error: publicNewsError(err, "Could not update post") },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if ("error" in auth) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const admin = createAdminClient()
    const { error } = await admin.from("news_posts").delete().eq("id", id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("news delete error:", err)
    return NextResponse.json(
      { ok: false, error: publicNewsError(err, "Could not delete post") },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return { error: "Not signed in", status: 401 as const }
  }

  const email = user.email.toLowerCase()
  if (ADMIN_EMAILS.includes(email)) {
    return { user, email }
  }

  const admin = createAdminClient()
  const { data } = await admin
    .from("admin_emails")
    .select("email")
    .eq("email", email)
    .maybeSingle()

  if (!data) {
    return { error: "Not an admin", status: 403 as const }
  }

  return { user, email }
}

export async function GET() {
  try {
    const adminCheck = await requireAdmin()
    if ("error" in adminCheck) {
      return NextResponse.json(
        { ok: false, error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("vote_signatures")
      .select("*")
      .order("updated_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ ok: true, signatures: data ?? [] })
  } catch (err) {
    console.error("vote-signatures admin list error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not load signatures" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if ("error" in adminCheck) {
      return NextResponse.json(
        { ok: false, error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    const body = (await request.json()) as {
      userId?: string
      authorName?: string
      imagePath?: string
      color?: string
    }

    if (!body.userId || body.userId !== adminCheck.user.id) {
      return NextResponse.json({ ok: false, error: "Invalid user" }, { status: 400 })
    }
    if (!body.imagePath || !body.color) {
      return NextResponse.json(
        { ok: false, error: "Missing signature image or color" },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const { data: existing } = await admin
      .from("vote_signatures")
      .select("x, y, width, rotation")
      .eq("user_id", adminCheck.user.id)
      .maybeSingle()

    const reviewedAt = new Date().toISOString()
    const { data, error } = await admin
      .from("vote_signatures")
      .upsert(
        {
          user_id: adminCheck.user.id,
          author_name: body.authorName ?? "Admin",
          image_path: body.imagePath,
          color: body.color,
          x: Number(existing?.x ?? 0.4),
          y: Number(existing?.y ?? 0.42),
          width: Number(existing?.width ?? 0.18),
          rotation: Number(existing?.rotation ?? 0),
          status: "approved",
          reviewed_by: adminCheck.user.id,
          reviewed_at: reviewedAt,
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, signature: data })
  } catch (err) {
    console.error("vote-signatures admin save error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not save signature" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if ("error" in adminCheck) {
      return NextResponse.json(
        { ok: false, error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    const body = (await request.json()) as {
      id?: string
      status?: "approved" | "rejected"
    }

    if (!body.id || (body.status !== "approved" && body.status !== "rejected")) {
      return NextResponse.json({ ok: false, error: "Invalid moderation action" }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from("vote_signatures")
      .update({
        status: body.status,
        reviewed_by: adminCheck.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", body.id)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("vote-signatures admin moderate error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not moderate signature" },
      { status: 500 }
    )
  }
}

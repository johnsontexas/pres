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

async function isAdminEmail(email: string) {
  if (ADMIN_EMAILS.includes(email)) return true

  const admin = createAdminClient()
  const { data } = await admin
    .from("admin_emails")
    .select("email")
    .eq("email", email)
    .maybeSingle()

  return Boolean(data)
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSignedInUser()
    if ("error" in auth) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
    }

    const body = (await request.json()) as {
      userId?: string
      authorName?: string
      imagePath?: string
      color?: string
    }

    if (!body.userId || body.userId !== auth.user.id) {
      return NextResponse.json({ ok: false, error: "Invalid user" }, { status: 400 })
    }
    if (!body.imagePath || !body.color) {
      return NextResponse.json(
        { ok: false, error: "Missing signature image or color" },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const userIsAdmin = await isAdminEmail(auth.email)
    const { data: existing } = await admin
      .from("vote_signatures")
      .select("x, y, width, rotation")
      .eq("user_id", auth.user.id)
      .maybeSingle()

    const reviewedAt = userIsAdmin ? new Date().toISOString() : null
    const { data, error } = await admin
      .from("vote_signatures")
      .upsert(
        {
          user_id: auth.user.id,
          author_name: body.authorName ?? "User",
          image_path: body.imagePath,
          color: body.color,
          x: Number(existing?.x ?? 0.18),
          y: Number(existing?.y ?? 0.82),
          width: Number(existing?.width ?? 0.18),
          rotation: Number(existing?.rotation ?? 0),
          status: userIsAdmin ? "approved" : "pending",
          reviewed_by: userIsAdmin ? auth.user.id : null,
          reviewed_at: reviewedAt,
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, signature: data })
  } catch (err) {
    console.error("vote-signatures save error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not save signature" },
      { status: 500 }
    )
  }
}

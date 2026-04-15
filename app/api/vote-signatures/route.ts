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
  const admin = createAdminClient()

  if (ADMIN_EMAILS.includes(email)) {
    await admin.from("admin_emails").upsert({ email }, { onConflict: "email" })
    return true
  }

  const { data } = await admin
    .from("admin_emails")
    .select("email")
    .eq("email", email)
    .maybeSingle()

  return Boolean(data)
}

function validPlacement(value: unknown): value is {
  x: number
  y: number
  width: number
  rotation: number
  color: string
} {
  if (!value || typeof value !== "object") return false
  const placement = value as Record<string, unknown>
  return (
    typeof placement.x === "number" &&
    typeof placement.y === "number" &&
    typeof placement.width === "number" &&
    typeof placement.rotation === "number" &&
    typeof placement.color === "string" &&
    placement.x >= 0 &&
    placement.x <= 1 &&
    placement.y >= 0 &&
    placement.y <= 1 &&
    placement.width >= 0.08 &&
    placement.width <= 0.28 &&
    placement.rotation >= -12 &&
    placement.rotation <= 12
  )
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
    if (userIsAdmin && data.status !== "approved") {
      throw new Error("Admin signature was saved but the database trigger kept it pending. Run the updated signature SQL.")
    }

    return NextResponse.json({ ok: true, signature: data })
  } catch (err) {
    console.error("vote-signatures save error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not save signature" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getSignedInUser()
    if ("error" in auth) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
    }

    const body = (await request.json()) as {
      id?: string
      placement?: unknown
    }

    if (!body.id || !validPlacement(body.placement)) {
      return NextResponse.json({ ok: false, error: "Invalid placement" }, { status: 400 })
    }

    const admin = createAdminClient()
    const userIsAdmin = await isAdminEmail(auth.email)
    const { data: existing, error: existingError } = await admin
      .from("vote_signatures")
      .select("id, user_id")
      .eq("id", body.id)
      .maybeSingle()

    if (existingError) throw existingError
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Signature not found" }, { status: 404 })
    }
    if (!userIsAdmin && existing.user_id !== auth.user.id) {
      return NextResponse.json({ ok: false, error: "Not allowed" }, { status: 403 })
    }

    const { data, error } = await admin
      .from("vote_signatures")
      .update(body.placement)
      .eq("id", body.id)
      .select("*")
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, signature: data })
  } catch (err) {
    console.error("vote-signatures placement error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not save placement" },
      { status: 500 }
    )
  }
}

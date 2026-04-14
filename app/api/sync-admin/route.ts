import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

/**
 * POST /api/sync-admin
 * If the current user's email is in NEXT_PUBLIC_ADMIN_EMAILS, ensure they exist in
 * admin_emails so Supabase RLS (e.g. for news_posts) treats them as admin.
 */
export async function POST() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY not set" },
        { status: 503 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 })
    }

    const email = user.email.toLowerCase()
    if (!ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ ok: false, error: "Not an admin" }, { status: 403 })
    }

    const admin = createAdminClient()
    await admin.from("admin_emails").upsert({ email }, { onConflict: "email" })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("sync-admin error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    )
  }
}

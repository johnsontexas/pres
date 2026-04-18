import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSuperAdminEmail, requireAdmin, requireSuperAdmin } from "@/lib/server-auth"

async function getReviewRequired(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "question_review_required")
    .maybeSingle()

  return Boolean((data?.value as { enabled?: boolean } | null)?.enabled)
}

async function getShutdownSettings(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "site_shutdown")
    .maybeSingle()
  const value = (data?.value as {
    enabled?: boolean
    title?: string
    caption?: string
    showBrand?: boolean
  } | null) ?? {}

  return {
    enabled: Boolean(value.enabled),
    title: value.title || "This site is temporarily unavailable",
    caption: value.caption || "Please check back later.",
    showBrand: value.showBrand !== false,
  }
}

export async function GET() {
  try {
    const auth = await requireAdmin()
    if ("error" in auth) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
    }

    const admin = createAdminClient()
    const [reviewRequired, shutdown, questions, banned, signatures, admins, superAdmins] = await Promise.all([
      getReviewRequired(admin),
      getShutdownSettings(admin),
      admin
        .from("questions")
        .select("id, author, author_id, text, created_at, status, is_anonymous")
        .order("created_at", { ascending: false }),
      admin.from("banned_askers").select("*"),
      admin
        .from("vote_signatures")
        .select("id, user_id, author_name, author_email, glow_enabled, glow_granted_by_admin, status")
        .order("updated_at", { ascending: false }),
      admin.from("admin_emails").select("email").order("email", { ascending: true }),
      admin.from("super_admin_emails").select("email").order("email", { ascending: true }),
    ])

    if (questions.error) throw questions.error
    if (banned.error) throw banned.error
    if (signatures.error && signatures.error.code !== "42703") throw signatures.error
    if (admins.error && admins.error.code !== "42P01") throw admins.error
    if (superAdmins.error && superAdmins.error.code !== "42P01") throw superAdmins.error
    const isSuperAdmin = await isSuperAdminEmail(auth.email)

    const bannedIds = new Set((banned.data ?? []).map((row) => row.user_id as string))
    const askerMap = new Map<string, { userId: string; name: string; questionCount: number; isBanned: boolean }>()
    for (const question of questions.data ?? []) {
      const userId = question.author_id as string
      const current = askerMap.get(userId)
      askerMap.set(userId, {
        userId,
        name: (question.author as string) || "Unknown",
        questionCount: (current?.questionCount ?? 0) + 1,
        isBanned: bannedIds.has(userId),
      })
    }

    return NextResponse.json({
      ok: true,
      isSuperAdmin,
      reviewRequired,
      shutdown,
      questions: questions.data ?? [],
      askers: [...askerMap.values()].sort((a, b) => b.questionCount - a.questionCount),
      signatures: signatures.error ? [] : signatures.data ?? [],
      admins: admins.error ? [] : admins.data ?? [],
      superAdmins: superAdmins.error ? [] : superAdmins.data ?? [],
    })
  } catch (err) {
    console.error("admin panel get error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not load admin panel" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if ("error" in auth) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
    }

    const body = (await request.json()) as {
      action?: "set-review-required" | "set-ban" | "set-glow" | "moderate-question" | "set-shutdown" | "add-admin" | "delete-admin"
      enabled?: boolean
      userId?: string
      signatureId?: string
      questionId?: string
      status?: "approved" | "rejected" | "pending"
      email?: string
      title?: string
      caption?: string
      showBrand?: boolean
    }
    const admin = createAdminClient()

    if (body.action === "set-review-required") {
      const { error } = await admin.from("app_settings").upsert(
        {
          key: "question_review_required",
          value: { enabled: Boolean(body.enabled) },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      )
      if (error) throw error
      return NextResponse.json({ ok: true })
    }

    if (body.action === "set-ban") {
      if (!body.userId) {
        return NextResponse.json({ ok: false, error: "Missing user" }, { status: 400 })
      }
      if (body.enabled) {
        const { error } = await admin
          .from("banned_askers")
          .upsert({ user_id: body.userId, created_at: new Date().toISOString() }, { onConflict: "user_id" })
        if (error) throw error
      } else {
        const { error } = await admin.from("banned_askers").delete().eq("user_id", body.userId)
        if (error) throw error
      }
      return NextResponse.json({ ok: true })
    }

    if (body.action === "set-glow") {
      if (!body.signatureId) {
        return NextResponse.json({ ok: false, error: "Missing signature" }, { status: 400 })
      }
      const enabled = Boolean(body.enabled)
      const { error } = await admin
        .from("vote_signatures")
        .update({
          glow_granted_by_admin: enabled,
          glow_enabled: enabled,
          reviewed_by: auth.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", body.signatureId)
      if (error) throw error
      return NextResponse.json({ ok: true })
    }

    if (body.action === "set-shutdown") {
      const superAuth = await requireSuperAdmin()
      if ("error" in superAuth) {
        return NextResponse.json({ ok: false, error: superAuth.error }, { status: superAuth.status })
      }
      const { error } = await admin.from("app_settings").upsert(
        {
          key: "site_shutdown",
          value: {
            enabled: Boolean(body.enabled),
            title: String(body.title ?? "This site is temporarily unavailable").trim(),
            caption: String(body.caption ?? "Please check back later.").trim(),
            showBrand: body.showBrand !== false,
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      )
      if (error) throw error
      return NextResponse.json({ ok: true })
    }

    if (body.action === "add-admin" || body.action === "delete-admin") {
      const superAuth = await requireSuperAdmin()
      if ("error" in superAuth) {
        return NextResponse.json({ ok: false, error: superAuth.error }, { status: superAuth.status })
      }
      const email = String(body.email ?? "").trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 })
      }

      if (body.action === "add-admin") {
        const { error } = await admin.from("admin_emails").upsert({ email }, { onConflict: "email" })
        if (error) throw error
      } else {
        if (await isSuperAdminEmail(email)) {
          return NextResponse.json({ ok: false, error: "You cannot remove a super admin from admins." }, { status: 400 })
        }
        const { error } = await admin.from("admin_emails").delete().eq("email", email)
        if (error) throw error
      }
      return NextResponse.json({ ok: true })
    }

    if (body.action === "moderate-question") {
      if (!body.questionId || (body.status !== "approved" && body.status !== "rejected" && body.status !== "pending")) {
        return NextResponse.json({ ok: false, error: "Invalid question status" }, { status: 400 })
      }
      const { error } = await admin
        .from("questions")
        .update({
          status: body.status,
          reviewed_by: auth.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", body.questionId)
      if (error) throw error
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 })
  } catch (err) {
    console.error("admin panel patch error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not update admin panel" },
      { status: 500 }
    )
  }
}

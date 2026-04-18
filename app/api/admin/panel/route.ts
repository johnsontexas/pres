import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/server-auth"

async function getReviewRequired(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "question_review_required")
    .maybeSingle()

  return Boolean((data?.value as { enabled?: boolean } | null)?.enabled)
}

export async function GET() {
  try {
    const auth = await requireAdmin()
    if ("error" in auth) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
    }

    const admin = createAdminClient()
    const [reviewRequired, questions, banned, signatures] = await Promise.all([
      getReviewRequired(admin),
      admin
        .from("questions")
        .select("id, author, author_id, text, created_at, status, is_anonymous")
        .order("created_at", { ascending: false }),
      admin.from("banned_askers").select("*"),
      admin
        .from("vote_signatures")
        .select("id, user_id, author_name, author_email, glow_enabled, glow_granted_by_admin, status")
        .order("updated_at", { ascending: false }),
    ])

    if (questions.error) throw questions.error
    if (banned.error) throw banned.error
    if (signatures.error && signatures.error.code !== "42703") throw signatures.error

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
      reviewRequired,
      questions: questions.data ?? [],
      askers: [...askerMap.values()].sort((a, b) => b.questionCount - a.questionCount),
      signatures: signatures.error ? [] : signatures.data ?? [],
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
      action?: "set-review-required" | "set-ban" | "set-glow" | "moderate-question"
      enabled?: boolean
      userId?: string
      signatureId?: string
      questionId?: string
      status?: "approved" | "rejected" | "pending"
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

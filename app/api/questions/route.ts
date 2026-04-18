import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { containsBlockedLanguage } from "@/lib/content-moderation"
import { getSignedInUser, isAdminEmail } from "@/lib/server-auth"

const MAX_QUESTION_LENGTH = 300

async function getReviewRequired(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "question_review_required")
    .maybeSingle()

  return Boolean((data?.value as { enabled?: boolean } | null)?.enabled)
}

async function isBanned(admin: ReturnType<typeof createAdminClient>, userId: string, email: string) {
  const { data } = await admin
    .from("banned_askers")
    .select("user_id")
    .or(`user_id.eq.${userId},email.eq.${email}`)
    .maybeSingle()

  return Boolean(data)
}

export async function GET() {
  try {
    const auth = await getSignedInUser()
    const admin = createAdminClient()
    const userIsAdmin = !("error" in auth) && (await isAdminEmail(auth.email))

    let query = admin.from("questions").select("*").order("created_at", { ascending: false })
    if (!userIsAdmin) query = query.eq("status", "approved")

    let { data, error } = await query
    if (error && error.code === "42703") {
      const retry = await admin.from("questions").select("*").order("created_at", { ascending: false })
      data = retry.data
      error = retry.error
    }
    if (error) throw error

    return NextResponse.json({ ok: true, questions: data ?? [] })
  } catch (err) {
    console.error("questions list error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not load questions" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSignedInUser()
    if ("error" in auth) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
    }

    const body = (await request.json()) as {
      text?: unknown
      author?: unknown
      isAnonymous?: unknown
    }
    const text = String(body.text ?? "").trim()
    if (text.length < 10) {
      return NextResponse.json({ ok: false, error: "Your question is too short." }, { status: 400 })
    }
    if (text.length > MAX_QUESTION_LENGTH) {
      return NextResponse.json(
        { ok: false, error: `Please keep your question under ${MAX_QUESTION_LENGTH} characters.` },
        { status: 400 }
      )
    }
    if (containsBlockedLanguage(text)) {
      return NextResponse.json(
        { ok: false, error: "Please remove inappropriate language before posting." },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const userIsAdmin = await isAdminEmail(auth.email)
    if (!userIsAdmin && (await isBanned(admin, auth.user.id, auth.email))) {
      return NextResponse.json(
        { ok: false, error: "You are not allowed to ask new questions at this time." },
        { status: 403 }
      )
    }

    const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await admin
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("author_id", auth.user.id)
      .gte("created_at", cutoff)

    if (!countError && (count ?? 0) >= 5) {
      return NextResponse.json(
        { ok: false, error: "You can ask up to 5 questions per hour. Please wait a bit before asking another." },
        { status: 429 }
      )
    }

    const reviewRequired = await getReviewRequired(admin)
    const payload = {
      author: String(body.author ?? auth.user.user_metadata?.name ?? auth.email.split("@")[0]),
      author_id: auth.user.id,
      text,
      is_anonymous: Boolean(body.isAnonymous),
      status: userIsAdmin || !reviewRequired ? "approved" : "pending",
    }

    let { data, error } = await admin.from("questions").insert(payload).select("*").single()
    if (error && error.code === "42703") {
      const { status: _status, ...fallbackPayload } = payload
      const retry = await admin.from("questions").insert(fallbackPayload).select("*").single()
      data = retry.data
      error = retry.error
    }
    if (error) throw error

    return NextResponse.json({ ok: true, question: data, reviewRequired })
  } catch (err) {
    console.error("questions create error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not submit question" },
      { status: 500 }
    )
  }
}

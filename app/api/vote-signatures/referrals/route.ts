import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const MAX_REFERRALS = 5

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

function cleanEmails(emails: unknown) {
  if (!Array.isArray(emails)) return []
  return [...new Set(
    emails
      .map((email) => String(email).trim().toLowerCase())
      .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  )].slice(0, MAX_REFERRALS)
}

async function glowCreditCount(admin: ReturnType<typeof createAdminClient>, email: string) {
  const { data: referrals, error } = await admin
    .from("vote_signature_referrals")
    .select("referrer_user_id")
    .eq("referred_email", email)

  if (error || !referrals?.length) return 0

  const referrerIds = [...new Set(referrals.map((row) => row.referrer_user_id as string))]
  const { data: signatures } = await admin
    .from("vote_signatures")
    .select("user_id")
    .in("user_id", referrerIds)
    .neq("status", "rejected")

  return new Set((signatures ?? []).map((row) => row.user_id as string)).size
}

async function responseForUser(userId: string, email: string) {
  const admin = createAdminClient()
  const [{ data: mine }, credits] = await Promise.all([
    admin
      .from("vote_signature_referrals")
      .select("referred_email")
      .eq("referrer_user_id", userId)
      .order("created_at", { ascending: true }),
    glowCreditCount(admin, email),
  ])

  return NextResponse.json({
    ok: true,
    emails: (mine ?? []).map((row) => row.referred_email as string),
    credits,
    glowUnlocked: credits >= MAX_REFERRALS,
  })
}

export async function GET() {
  try {
    const auth = await getSignedInUser()
    if ("error" in auth) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
    }

    return responseForUser(auth.user.id, auth.email)
  } catch (err) {
    console.error("vote-signatures referrals get error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not load referrals" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getSignedInUser()
    if ("error" in auth) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
    }

    const admin = createAdminClient()
    const { data: mySignature } = await admin
      .from("vote_signatures")
      .select("id")
      .eq("user_id", auth.user.id)
      .neq("status", "rejected")
      .maybeSingle()

    if (!mySignature) {
      return NextResponse.json(
        { ok: false, error: "You need a signature before adding friends." },
        { status: 400 }
      )
    }

    const body = (await request.json()) as { emails?: unknown }
    const emails = cleanEmails(body.emails).filter((email) => email !== auth.email)

    const { data: existingSignatures } = emails.length
      ? await admin
          .from("vote_signatures")
          .select("author_email")
          .in("author_email", emails)
          .neq("status", "rejected")
      : { data: [] }

    const allowedEmails = new Set(
      (existingSignatures ?? []).map((row) => String(row.author_email).toLowerCase())
    )
    const acceptedEmails = emails.filter((email) => allowedEmails.has(email))

    await admin.from("vote_signature_referrals").delete().eq("referrer_user_id", auth.user.id)

    if (acceptedEmails.length > 0) {
      const { error } = await admin.from("vote_signature_referrals").insert(
        acceptedEmails.map((email) => ({
          referrer_user_id: auth.user.id,
          referrer_email: auth.email,
          referred_email: email,
        }))
      )
      if (error) throw error
    }

    return responseForUser(auth.user.id, auth.email)
  } catch (err) {
    console.error("vote-signatures referrals put error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not save referrals" },
      { status: 500 }
    )
  }
}

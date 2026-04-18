import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const MAX_REFERRALS = 5

type ReferralResult = {
  email: string
  status: "accepted" | "invalid"
  reason?: string
}

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

function parseEmails(emails: unknown, ownEmail: string) {
  const seen = new Set<string>()
  const clean: string[] = []
  const results: ReferralResult[] = []

  if (!Array.isArray(emails)) return { clean, results }

  for (const raw of emails.slice(0, MAX_REFERRALS)) {
    const email = String(raw).trim().toLowerCase()
    if (!email) continue

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      results.push({ email, status: "invalid", reason: "Not a valid email." })
      continue
    }
    if (email === ownEmail) {
      results.push({ email, status: "invalid", reason: "You cannot add yourself." })
      continue
    }
    if (seen.has(email)) {
      results.push({ email, status: "invalid", reason: "Duplicate email." })
      continue
    }

    seen.add(email)
    clean.push(email)
  }

  return { clean, results }
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
  const [{ data: mine }, { data: signature }, credits] = await Promise.all([
    admin
      .from("vote_signature_referrals")
      .select("referred_email")
      .eq("referrer_user_id", userId)
      .order("created_at", { ascending: true }),
    admin
      .from("vote_signatures")
      .select("glow_granted_by_admin")
      .eq("user_id", userId)
      .maybeSingle(),
    glowCreditCount(admin, email),
  ])
  const adminGrantedGlow = Boolean(signature?.glow_granted_by_admin)

  return NextResponse.json({
    ok: true,
    emails: (mine ?? []).map((row) => row.referred_email as string),
    credits,
    glowUnlocked: adminGrantedGlow || credits >= MAX_REFERRALS,
    results: [],
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
    const parsed = parseEmails(body.emails, auth.email)
    const emails = parsed.clean

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
    const rejectedExistingChecks: ReferralResult[] = emails
      .filter((email) => !allowedEmails.has(email))
      .map((email) => ({
        email,
        status: "invalid",
        reason: "This person needs to add a signature first.",
      }))

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

    const response = await responseForUser(auth.user.id, auth.email)
    const payload = await response.json()

    return NextResponse.json({
      ...payload,
      results: [
        ...acceptedEmails.map((email) => ({ email, status: "accepted" })),
        ...parsed.results,
        ...rejectedExistingChecks,
      ],
    })
  } catch (err) {
    console.error("vote-signatures referrals put error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not save referrals" },
      { status: 500 }
    )
  }
}

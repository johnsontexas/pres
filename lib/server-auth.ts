import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

export async function getSignedInUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return { error: "Not signed in", status: 401 as const }
  }

  return { user, email: user.email.toLowerCase() }
}

export async function isAdminEmail(email: string) {
  const admin = createAdminClient()
  const cleanEmail = email.toLowerCase()

  if (ADMIN_EMAILS.includes(cleanEmail)) {
    await admin.from("admin_emails").upsert({ email: cleanEmail }, { onConflict: "email" })
    return true
  }

  const { data } = await admin
    .from("admin_emails")
    .select("email")
    .eq("email", cleanEmail)
    .maybeSingle()

  return Boolean(data)
}

export async function requireAdmin() {
  const auth = await getSignedInUser()
  if ("error" in auth) return auth

  if (!(await isAdminEmail(auth.email))) {
    return { error: "Not an admin", status: 403 as const }
  }

  return auth
}

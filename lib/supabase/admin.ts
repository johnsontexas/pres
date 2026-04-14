import { createClient } from "@supabase/supabase-js"

/**
 * Server-only Supabase client with service role key. Use only in API routes or server code.
 * Set SUPABASE_SERVICE_ROLE_KEY in env (from Supabase Dashboard > Settings > API).
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set")
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

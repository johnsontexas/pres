import { NextResponse } from "next/server"
import { DEFAULT_COUNTDOWN_SETTINGS, normalizeCountdownSettings } from "@/lib/countdown-settings"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("app_settings")
      .select("value")
      .eq("key", "election_countdown")
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({
      ok: true,
      countdown: normalizeCountdownSettings(data?.value),
    })
  } catch (err) {
    console.error("countdown settings error:", err)
    return NextResponse.json({
      ok: true,
      countdown: DEFAULT_COUNTDOWN_SETTINGS,
    })
  }
}

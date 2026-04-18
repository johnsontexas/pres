import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"

async function getShutdownSettings() {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from("app_settings")
      .select("value")
      .eq("key", "site_shutdown")
      .maybeSingle()

    const value = (data?.value as {
      title?: string
      caption?: string
      showBrand?: boolean
    } | null) ?? {}

    return {
      title: value.title || "This site is temporarily unavailable",
      caption: value.caption || "Please check back later.",
      showBrand: value.showBrand !== false,
    }
  } catch {
    return {
      title: "This site is temporarily unavailable",
      caption: "Please check back later.",
      showBrand: true,
    }
  }
}

export default async function ShutdownPage() {
  const shutdown = await getShutdownSettings()

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-6 text-primary-foreground">
      <div className="mx-auto max-w-2xl text-center">
        {shutdown.showBrand && (
          <p className="mb-8 text-sm font-semibold uppercase tracking-wide text-primary-foreground/75">
            Vote Daniel Johnson
          </p>
        )}
        <h1 className="font-serif text-4xl font-bold leading-tight md:text-6xl">
          {shutdown.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-primary-foreground/85 md:text-lg">
          {shutdown.caption}
        </p>
        <Link
          href="/signin?redirect=/admin"
          className="mt-8 inline-flex rounded-lg border border-primary-foreground/35 px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
        >
          Admin sign in
        </Link>
      </div>
    </main>
  )
}

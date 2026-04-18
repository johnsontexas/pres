"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Power, Shield, Sparkles, UserPlus, UserX } from "lucide-react"
import { useAuth } from "@/components/auth-context"

type AdminQuestion = {
  id: string
  author: string
  author_id: string
  text: string
  created_at: string
  status?: "approved" | "pending" | "rejected"
}

type AdminAsker = {
  userId: string
  name: string
  questionCount: number
  isBanned: boolean
}

type AdminSignature = {
  id: string
  author_name: string
  author_email?: string | null
  glow_enabled?: boolean | null
  glow_granted_by_admin?: boolean | null
  status: string
}

type AdminPanelState = {
  isSuperAdmin: boolean
  reviewRequired: boolean
  shutdown: {
    enabled: boolean
    title: string
    caption: string
    showBrand: boolean
  }
  questions: AdminQuestion[]
  askers: AdminAsker[]
  signatures: AdminSignature[]
  admins: { email: string }[]
  superAdmins: { email: string }[]
}

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [panel, setPanel] = useState<AdminPanelState | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState("")

  const loadPanel = async () => {
    const response = await fetch("/api/admin/panel")
    const result = (await response.json()) as { ok: boolean; error?: string } & Partial<AdminPanelState>
    if (!response.ok || !result.ok) {
      setError(result.error ?? "Could not load admin panel.")
      return
    }
    setPanel({
      isSuperAdmin: Boolean(result.isSuperAdmin),
      reviewRequired: Boolean(result.reviewRequired),
      shutdown: result.shutdown ?? {
        enabled: false,
        title: "This site is temporarily unavailable",
        caption: "Please check back later.",
        showBrand: true,
      },
      questions: result.questions ?? [],
      askers: result.askers ?? [],
      signatures: result.signatures ?? [],
      admins: result.admins ?? [],
      superAdmins: result.superAdmins ?? [],
    })
  }

  useEffect(() => {
    if (isLoading) return
    if (!user?.isAdmin) {
      router.push("/")
      return
    }
    void loadPanel()
  }, [isLoading, user?.isAdmin])

  const adminAction = async (payload: Record<string, unknown>, successMessage: string) => {
    setSaving(true)
    setMessage("")
    setError("")
    try {
      const response = await fetch("/api/admin/panel", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = (await response.json()) as { ok: boolean; error?: string }
      if (!response.ok || !result.ok) throw new Error(result.error ?? "Could not save.")
      setMessage(successMessage)
      await loadPanel()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !panel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const pendingQuestions = panel.questions.filter((question) => question.status === "pending")
  const recentQuestions = panel.questions.slice(0, 10)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
              <Shield className="h-4 w-4" />
              Admin Panel
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
              Site controls
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Review questions, ban accounts from asking, and grant glowing signatures.
            </p>
          </div>
          <Link href="/questions" className="text-sm font-semibold text-primary hover:underline">
            Back to Q&amp;A
          </Link>
        </div>

        {(message || error) && (
          <p className={`mt-5 rounded-lg border px-3 py-2 text-sm ${error ? "border-destructive/20 text-destructive" : "border-primary/20 text-primary"}`}>
            {error || message}
          </p>
        )}

        <section className="mt-8 rounded-lg border border-border bg-card p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="font-semibold text-foreground">Question review mode</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                When this is on, new student questions wait for approval before appearing.
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-foreground">
              Off
              <input
                type="checkbox"
                checked={panel.reviewRequired}
                disabled={saving}
                onChange={(event) =>
                  adminAction(
                    {
                      action: "set-review-required",
                      enabled: event.target.checked,
                    },
                    event.target.checked ? "Review mode turned on." : "Review mode turned off."
                  )
                }
                className="h-5 w-5 rounded border-input text-primary focus:ring-primary"
              />
              On
            </label>
          </div>
        </section>

        {panel.isSuperAdmin && (
          <section className="mt-6 rounded-lg border border-primary/20 bg-card p-5">
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <Power className="h-4 w-4" />
              Site shutdown
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              When enabled, regular visitors are redirected to the shutdown page. Admins can still use the site and admin panel.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-medium text-foreground">
                Shutdown title
                <input
                  value={panel.shutdown.title}
                  onChange={(event) =>
                    setPanel({ ...panel, shutdown: { ...panel.shutdown, title: event.target.value } })
                  }
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-medium text-foreground">
                Caption
                <input
                  value={panel.shutdown.caption}
                  onChange={(event) =>
                    setPanel({ ...panel, shutdown: { ...panel.shutdown, caption: event.target.value } })
                  }
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={panel.shutdown.showBrand}
                  onChange={(event) =>
                    setPanel({ ...panel, shutdown: { ...panel.shutdown, showBrand: event.target.checked } })
                  }
                  className="h-4 w-4 rounded border-input text-primary"
                />
                Show Vote Daniel Johnson
              </label>
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  adminAction(
                    {
                      action: "set-shutdown",
                      enabled: !panel.shutdown.enabled,
                      title: panel.shutdown.title,
                      caption: panel.shutdown.caption,
                      showBrand: panel.shutdown.showBrand,
                    },
                    panel.shutdown.enabled ? "Shutdown turned off." : "Shutdown turned on."
                  )
                }
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                  panel.shutdown.enabled ? "bg-destructive" : "bg-primary"
                }`}
              >
                {panel.shutdown.enabled ? "Turn shutdown off" : "Turn shutdown on"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  adminAction(
                    {
                      action: "set-shutdown",
                      enabled: panel.shutdown.enabled,
                      title: panel.shutdown.title,
                      caption: panel.shutdown.caption,
                      showBrand: panel.shutdown.showBrand,
                    },
                    "Shutdown message saved."
                  )
                }
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-60"
              >
                Save message
              </button>
            </div>
          </section>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground">
              Pending questions ({pendingQuestions.length})
            </h2>
            <div className="mt-4 space-y-3">
              {(pendingQuestions.length ? pendingQuestions : recentQuestions).map((question) => (
                <div key={question.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{question.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {question.author} · {question.status ?? "approved"}
                      </p>
                    </div>
                    <Link href={`/questions/${question.id}`} className="text-xs font-semibold text-primary">
                      Open
                    </Link>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        adminAction(
                          { action: "moderate-question", questionId: question.id, status: "approved" },
                          "Question approved."
                        )
                      }
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        adminAction(
                          { action: "moderate-question", questionId: question.id, status: "rejected" },
                          "Question rejected."
                        )
                      }
                      className="rounded-lg border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {panel.questions.length === 0 && (
                <p className="text-sm text-muted-foreground">No questions yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <UserX className="h-4 w-4" />
              Ban users from asking
            </h2>
            <div className="mt-4 space-y-3">
              {panel.askers.map((asker) => (
                <div
                  key={asker.userId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{asker.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {asker.questionCount} {asker.questionCount === 1 ? "question" : "questions"}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      adminAction(
                        { action: "set-ban", userId: asker.userId, enabled: !asker.isBanned },
                        asker.isBanned ? "User unbanned." : "User banned from asking."
                      )
                    }
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${
                      asker.isBanned
                        ? "border-primary/30 text-primary"
                        : "border-destructive/20 text-destructive"
                    }`}
                  >
                    {asker.isBanned ? "Unban" : "Ban"}
                  </button>
                </div>
              ))}
              {panel.askers.length === 0 && (
                <p className="text-sm text-muted-foreground">No question authors yet.</p>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <Sparkles className="h-4 w-4" />
            Glowing signatures
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {panel.signatures.map((signature) => (
              <div
                key={signature.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{signature.author_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {signature.author_email ?? "No email"} · {signature.status}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    adminAction(
                      {
                        action: "set-glow",
                        signatureId: signature.id,
                        enabled: !signature.glow_granted_by_admin,
                      },
                      signature.glow_granted_by_admin ? "Glow removed." : "Glow granted."
                    )
                  }
                  className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary disabled:opacity-60"
                >
                  {signature.glow_granted_by_admin ? "Remove glow" : "Grant glow"}
                </button>
              </div>
            ))}
            {panel.signatures.length === 0 && (
              <p className="text-sm text-muted-foreground">No signatures yet.</p>
            )}
          </div>
        </section>

        {panel.isSuperAdmin && (
          <section className="mt-6 rounded-lg border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <UserPlus className="h-4 w-4" />
              Admins
            </h2>
            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <input
                type="email"
                value={newAdminEmail}
                onChange={(event) => setNewAdminEmail(event.target.value)}
                placeholder="admin@email.com"
                className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={saving || !newAdminEmail.trim()}
                onClick={() =>
                  adminAction(
                    { action: "add-admin", email: newAdminEmail },
                    "Admin added."
                  ).then(() => setNewAdminEmail(""))
                }
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                Add admin
              </button>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {panel.admins.map((admin) => {
                const isSuper = panel.superAdmins.some((item) => item.email === admin.email)
                return (
                  <div
                    key={admin.email}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{admin.email}</p>
                      {isSuper && <p className="text-xs font-semibold text-primary">Super admin</p>}
                    </div>
                    {!isSuper && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          adminAction(
                            { action: "delete-admin", email: admin.email },
                            "Admin removed."
                          )
                        }
                        className="rounded-lg border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive disabled:opacity-60"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { addQuestion } from "@/lib/questions"
import { createClient } from "@/lib/supabase/client"

export default function AskPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    router.push("/signin?redirect=/questions/ask")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) {
      setError("Please enter your question.")
      return
    }
    if (trimmed.length < 10) {
      setError("Your question is too short. Please be more specific.")
      return
    }

    const supabase = createClient()
    // Block banned users from asking
    const { data: bannedRow } = await supabase
      .from("banned_askers")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (bannedRow) {
      setError("You are not allowed to ask new questions at this time.")
      return
    }

    // Simple rate limit: max 5 questions per user per hour
    const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("author_id", user.id)
      .gte("created_at", cutoff)

    if (!countError && (count ?? 0) >= 5) {
      setError("You can ask up to 5 questions per hour. Please wait a bit before asking another.")
      return
    }

    await addQuestion(trimmed, user.name, user.id, isAnonymous)
    router.push("/questions")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center px-6 py-4">
          <Link
            href="/questions"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Questions
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
          Ask a Question
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Posting as <span className="font-medium text-foreground">{user.name}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <label htmlFor="question-text" className="text-sm font-medium text-foreground">
            Your Question
          </label>
          <textarea
            id="question-text"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setError("")
            }}
            placeholder="What would you like to ask about my platform, ideas, or plans?"
            rows={5}
            className="mt-2 w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

          <div className="mt-4 flex items-start gap-2">
            <input
              id="ask-anonymously"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="ask-anonymously" className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Ask anonymously</span>
              <br />
              <span className="text-xs text-muted-foreground">
                Your name and email are still visible to admins.
              </span>
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Submit Question
            </button>
            <Link
              href="/questions"
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

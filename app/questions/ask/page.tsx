"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { addQuestion } from "@/lib/questions"

export default function AskPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [text, setText] = useState("")
  const [error, setError] = useState("")

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

  const handleSubmit = (e: React.FormEvent) => {
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

    addQuestion(trimmed, user.name, user.id)
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

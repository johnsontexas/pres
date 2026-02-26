"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, ChevronUp, Trash2, CheckCircle2, Send, UserX } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { getQuestion, toggleUpvote, answerQuestion, deleteQuestion } from "@/lib/questions"
import { createClient } from "@/lib/supabase/client"
import type { Question } from "@/lib/questions"

export default function QuestionDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { user } = useAuth()
  const router = useRouter()
  const [question, setQuestion] = useState<Question | null>(null)
  const [answerText, setAnswerText] = useState("")
  const [editing, setEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isBanned, setIsBanned] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const q = await getQuestion(id)
      if (!q) {
        setQuestion(null)
        setIsLoading(false)
        return
      }
      setQuestion(q)
      if (q.answer) setAnswerText(q.answer)
      if (user?.isAdmin) {
        const supabase = createClient()
        const { data: bannedRow } = await supabase
          .from("banned_askers")
          .select("user_id")
          .eq("user_id", q.authorId)
          .maybeSingle()
        setIsBanned(Boolean(bannedRow))
      }
      setIsLoading(false)
    }
    void load()
  }, [id, user?.isAdmin])

  if (!question && !isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <h2 className="text-xl font-semibold text-foreground">Question not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been deleted.
        </p>
        <Link
          href="/questions"
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Back to Questions
        </Link>
      </div>
    )
  }

  const hasUpvoted = user && question ? question.upvotes.includes(user.id) : false

  const handleUpvote = async () => {
    if (!user) return
    await toggleUpvote(question.id, user.id)
    const updated = await getQuestion(question.id)
    setQuestion(updated)
  }

  const handleDelete = async () => {
    if (!user?.isAdmin) return
    await deleteQuestion(question.id)
    router.push("/questions")
  }

  const handleToggleBan = async () => {
    if (!user?.isAdmin || !question) return
    const supabase = createClient()
    if (isBanned) {
      await supabase.from("banned_askers").delete().eq("user_id", question.authorId)
      setIsBanned(false)
    } else {
      await supabase
        .from("banned_askers")
        .upsert({ user_id: question.authorId })
      setIsBanned(true)
    }
  }

  const handleAnswer = async () => {
    if (!user?.isAdmin || !answerText.trim()) return
    await answerQuestion(question.id, answerText.trim())
    const updated = await getQuestion(question.id)
    setQuestion(updated)
    setEditing(false)
  }

  const createdDate = question ? new Date(question.createdAt) : null
  const displayAuthor =
    question && question.isAnonymous && !user?.isAdmin ? "Anonymous" : question?.author

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/questions"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All Questions
          </Link>
          {user?.isAdmin && question && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleBan}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  isBanned
                    ? "border-green-600/30 text-green-700 hover:bg-green-600/10"
                    : "border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                }`}
              >
                <UserX className="h-4 w-4" />
                {isBanned ? "Unban from asking" : "Ban from asking"}
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-lg border border-destructive/20 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Question */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={handleUpvote}
                  disabled={!user}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                    hasUpvoted
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                  } ${!user ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                  aria-label="Upvote"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
                <span className="text-base font-bold tabular-nums text-foreground">
                  {question.upvotes.length}
                </span>
              </div>

              <div className="flex-1">
                <h1 className="font-serif text-2xl font-bold leading-snug text-foreground md:text-3xl">
                  {question.text}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>
                    Asked by{" "}
                    <span className="font-medium text-foreground">
                      {displayAuthor}
                    </span>
                  </span>
                  <span>
                    {createdDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Answer section */}
            <div className="mt-8 border-t border-border pt-8">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                {question.answer ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Candidate{"'"}s Answer
                  </>
                ) : (
                  "Awaiting Answer"
                )}
              </h2>

              {question.answer && !editing ? (
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-5 py-4">
                  <p className="leading-relaxed text-foreground whitespace-pre-wrap">
                    {question.answer}
                  </p>
                  {user?.isAdmin && (
                    <button
                      onClick={() => setEditing(true)}
                      className="mt-4 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Edit Answer
                    </button>
                  )}
                </div>
              ) : !question.answer && !user?.isAdmin ? (
                <p className="mt-4 text-muted-foreground">
                  This question hasn{"'"}t been answered yet. Check back soon!
                </p>
              ) : null}

              {/* Admin answer form */}
              {user?.isAdmin && (!question.answer || editing) && (
                <div className="mt-4">
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={handleAnswer}
                      className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      <Send className="h-4 w-4" />
                      {question.answer ? "Update Answer" : "Post Answer"}
                    </button>
                    {editing && (
                      <button
                        onClick={() => {
                          setEditing(false)
                          setAnswerText(question.answer ?? "")
                        }}
                        className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

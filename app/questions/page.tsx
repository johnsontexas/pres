"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { MessageSquarePlus } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { QuestionCard } from "@/components/question-card"
import { getQuestions, toggleUpvote, deleteQuestion } from "@/lib/questions"
import type { Question } from "@/lib/questions"

type SortMode = "top" | "newest"

export default function QuestionsPage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [sort, setSort] = useState<SortMode>("top")
  const [isLoading, setIsLoading] = useState(true)

  const refreshQuestions = useCallback(async () => {
    setIsLoading(true)
    const all = await getQuestions()
    const sorted = [...all]
    if (sort === "top") {
      sorted.sort((a, b) => b.upvotes.length - a.upvotes.length)
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    setQuestions(sorted)
    setIsLoading(false)
  }, [sort])

  useEffect(() => {
    void refreshQuestions()
  }, [refreshQuestions])

  const handleUpvote = async (id: string) => {
    if (!user) return
    await toggleUpvote(id, user.id)
    void refreshQuestions()
  }

  const handleDelete = async (id: string) => {
    if (!user?.isAdmin) return
    await deleteQuestion(id)
    void refreshQuestions()
  }

  const unanswered = questions.filter((q) => !q.answer).length

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 pt-6">
        <div className="mb-6 flex justify-end">
          {user ? (
            <Link
              href="/questions/ask"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Ask a Question
            </Link>
          ) : (
            <Link
              href="/signin?redirect=/questions/ask"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Sign In to Ask
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Ask Me Anything
          </h1>
          <p className="mt-2 text-muted-foreground">
            Got questions about my platform or ideas? Ask here and I{"'"}ll answer.
          </p>
          {user?.isAdmin && unanswered > 0 && (
            <p className="mt-2 text-sm font-medium text-accent">
              {unanswered} unanswered {unanswered === 1 ? "question" : "questions"}
            </p>
          )}
        </div>

        {/* Sort tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-secondary p-1">
          <button
            onClick={() => setSort("top")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              sort === "top"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Top Voted
          </button>
          <button
            onClick={() => setSort("newest")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              sort === "newest"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Newest
          </button>
        </div>

        {/* Questions list */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
            <MessageSquarePlus className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No questions yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to ask a question!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onUpvote={handleUpvote}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

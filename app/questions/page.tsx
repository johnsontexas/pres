"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { MessageSquarePlus, ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { QuestionCard } from "@/components/question-card"
import { getQuestions, toggleUpvote, deleteQuestion } from "@/lib/questions"
import type { Question } from "@/lib/questions"

type SortMode = "top" | "newest"

export default function QuestionsPage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [sort, setSort] = useState<SortMode>("top")

  const refreshQuestions = useCallback(() => {
    const all = getQuestions()
    if (sort === "top") {
      all.sort((a, b) => b.upvotes.length - a.upvotes.length)
    } else {
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    setQuestions(all)
  }, [sort])

  useEffect(() => {
    refreshQuestions()
  }, [refreshQuestions])

  const handleUpvote = (id: string) => {
    if (!user) return
    toggleUpvote(id, user.id)
    refreshQuestions()
  }

  const handleDelete = (id: string) => {
    if (!user?.isAdmin) return
    deleteQuestion(id)
    refreshQuestions()
  }

  const unanswered = questions.filter((q) => !q.answer).length

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Campaign
          </Link>
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

      <div className="mx-auto max-w-3xl px-6 py-8">
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
        {questions.length === 0 ? (
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

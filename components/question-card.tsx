"use client"

import Link from "next/link"
import { ChevronUp, MessageSquare, Trash2, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import type { Question } from "@/lib/questions"

export function QuestionCard({
  question,
  onUpvote,
  onDelete,
}: {
  question: Question
  onUpvote: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { user } = useAuth()
  const hasUpvoted = user ? question.upvotes.includes(user.id) : false
  const displayAuthor =
    question.isAnonymous && !user?.isAdmin ? "Anonymous" : question.author
  const timeAgo = getTimeAgo(question.createdAt)

  return (
    <div className="group flex gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30">
      {/* Upvote column */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={(e) => {
            e.preventDefault()
            onUpvote(question.id)
          }}
          disabled={!user}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
            hasUpvoted
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-primary/10"
          } ${!user ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          aria-label="Upvote"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {question.upvotes.length}
        </span>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Link href={`/questions/${question.id}`} className="group/link">
          <h3 className="text-base font-semibold leading-snug text-foreground group-hover/link:text-primary">
            {question.text}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>Asked by {displayAuthor}</span>
          <span>{timeAgo}</span>
          {question.answer && (
            <span className="flex items-center gap-1 text-primary">
              <CheckCircle2 className="h-3 w-3" />
              Answered
            </span>
          )}
          {user?.isAdmin && question.status !== "approved" && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase">
              {question.status}
            </span>
          )}
        </div>

        {question.answer && (
          <div className="mt-1 rounded-md bg-primary/5 px-3 py-2">
            <p className="line-clamp-2 text-sm text-foreground/80">
              {question.answer}
            </p>
          </div>
        )}
      </div>

      {/* Admin delete */}
      {user?.isAdmin && (
        <button
          onClick={(e) => {
            e.preventDefault()
            onDelete(question.id)
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          aria-label="Delete question"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

function getTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

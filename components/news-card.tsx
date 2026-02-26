"use client"

import { Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-context"

type NewsPost = {
  id: string
  title: string
  caption: string | null
  media_url: string
  media_type: "image" | "video"
  author_name: string
  created_at: string
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function NewsCard({
  post,
  onDelete,
}: {
  post: NewsPost
  onDelete: (id: string) => void
}) {
  const { user } = useAuth()

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-accent/20">
      {/* Media */}
      <div className="relative aspect-video overflow-hidden bg-secondary">
        {post.media_type === "video" ? (
          <video
            src={post.media_url}
            controls
            className="h-full w-full object-cover"
            preload="metadata"
          />
        ) : (
          <img
            src={post.media_url}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            crossOrigin="anonymous"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold leading-tight text-card-foreground">
              {post.title}
            </h3>
            {post.caption && (
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {post.caption}
              </p>
            )}
          </div>

          {/* Admin delete */}
          {user?.isAdmin && (
            <button
              onClick={() => onDelete(post.id)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              aria-label="Delete post"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{post.author_name}</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
        </div>
      </div>
    </article>
  )
}

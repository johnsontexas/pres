"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Newspaper } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { AdminUploadForm } from "@/components/admin-upload-form"
import { NewsCard } from "@/components/news-card"

type NewsPost = {
  id: string
  title: string
  caption: string | null
  media_url: string
  media_type: "image" | "video"
  author_name: string
  created_at: string
}

export default function NewsPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/news")
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return

    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" })
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id))
      }
    } catch {
      // silently fail
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Campaign
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-accent uppercase">Stay updated</p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
              Campaign News
            </h1>
            <p className="mt-3 max-w-lg text-muted-foreground">
              The latest updates, photos, and videos from the campaign trail.
            </p>
          </div>
          <AdminUploadForm onSuccess={fetchPosts} />
        </div>

        {/* Content */}
        <div className="mt-12">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
              <Newspaper className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-5 text-lg font-bold text-foreground">No news yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {user?.isAdmin
                  ? "Create your first post using the button above."
                  : "Check back soon for campaign updates!"}
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {posts.map((post) => (
                <NewsCard key={post.id} post={post} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

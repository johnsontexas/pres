"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Calendar } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { getPublishedPosts, getAllPosts } from "@/lib/news"
import type { NewsPost } from "@/lib/news"

export default function NewsPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true)
      const data = user?.isAdmin ? await getAllPosts() : await getPublishedPosts()
      setPosts(data)
      setIsLoading(false)
    }
    void loadPosts()
  }, [user?.isAdmin])

  return (
    <div className="min-h-screen bg-background">
      {user?.isAdmin && (
        <div className="mx-auto flex max-w-6xl justify-end px-6 pt-6">
          <Link
            href="/news/new"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-6 py-12 lg:py-20">
        <div className="fade-in mb-16 text-center">
          <h1 className="font-serif text-5xl font-bold leading-tight text-foreground md:text-6xl">
            Campaign News
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Stay updated with the latest announcements, events, and stories from the campaign trail.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
            <h3 className="text-lg font-semibold text-foreground">No news yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Check back soon for campaign updates and announcements.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="group fade-in"
              >
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg">
                  {post.imageUrl && (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {!post.isPublished && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">
                          DRAFT
                        </span>
                      )}
                    </div>
                    <h2 className="mb-2 font-serif text-xl font-bold leading-snug text-foreground group-hover:text-primary">
                      {post.title}
                    </h2>
                    <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 text-sm font-medium text-primary">
                      Read more →
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Edit2, Heart, Link as LinkIcon, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { getPostBySlug, deletePost, togglePostLike } from "@/lib/news"
import type { NewsPost } from "@/lib/news"

export default function NewsPostPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const router = useRouter()
  const { user } = useAuth()
  const [post, setPost] = useState<NewsPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true)
      const data = await getPostBySlug(slug)
      setPost(data)
      setIsLoading(false)
    }
    void loadPost()
  }, [slug])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return
    if (!post) return
    await deletePost(post.id)
    router.push("/news")
  }

  const handleLike = async () => {
    if (!user || !post) {
      router.push(`/signin?redirect=/news/${slug}`)
      return
    }

    const updated = await togglePostLike(post.id)
    if (updated) setPost(updated)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <h2 className="text-xl font-semibold text-foreground">Post not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This post may have been deleted.
        </p>
        <Link
          href="/news"
          className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Back to News
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 pt-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/news"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All News
          </Link>
          {user?.isAdmin && (
            <div className="flex gap-2">
              <Link
                href={`/news/${slug}/edit`}
                className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-full border border-destructive/20 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-6 pb-16 lg:pb-24">
        {post.imageUrl && (
          <div className="mb-12 aspect-[21/9] w-full overflow-hidden rounded-3xl">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="fade-in">
          <div className="mb-6 flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {!post.isPublished && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                DRAFT
              </span>
            )}
          </div>

          <h1 className="font-serif text-5xl font-bold leading-tight text-foreground md:text-6xl">
            {post.title}
          </h1>

          {post.links.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {post.links.map((link) => (
                <a
                  key={`${link.label}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-primary hover:bg-muted"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {post.excerpt && (
            <p className="mt-6 text-xl leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          <button
            type="button"
            onClick={handleLike}
            className={`mt-6 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
              user && post.likes.includes(user.id)
                ? "border-destructive/25 bg-destructive/10 text-destructive"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <Heart className={`h-4 w-4 ${user && post.likes.includes(user.id) ? "fill-current" : ""}`} />
            {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
          </button>

          <div className="prose prose-lg mt-12 max-w-none">
            <div
              className="whitespace-pre-wrap text-lg leading-relaxed text-foreground/90"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
            />
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <p className="text-sm text-muted-foreground">
              Posted by {post.author}
            </p>
          </div>
        </div>
      </article>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { createPost, generateSlug } from "@/lib/news"

export default function NewPostPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [saving, setSaving] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user?.isAdmin) {
    router.push("/news")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setSaving(true)
    const slug = generateSlug(title)
    await createPost({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      author: user.name,
      authorId: user.id,
      publishedAt: new Date().toISOString(),
      isPublished,
      imageUrl: imageUrl.trim() || null,
      slug,
    })
    router.push("/news")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center px-6 py-4">
          <Link
            href="/news"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="font-serif text-4xl font-bold text-foreground">
          Create News Post
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-foreground">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              required
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="mb-2 block text-sm font-medium text-foreground">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short description (optional)"
              rows={2}
              className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <label htmlFor="content" className="mb-2 block text-sm font-medium text-foreground">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content..."
              required
              rows={12}
              className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="mb-2 block text-sm font-medium text-foreground">
              Featured Image URL
            </label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg (optional)"
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isPublished"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="isPublished" className="text-sm text-foreground">
              Publish immediately
            </label>
          </div>

          <div className="flex gap-3 border-t border-border pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Post"}
            </button>
            <Link
              href="/news"
              className="rounded-full border border-border px-6 py-3 font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

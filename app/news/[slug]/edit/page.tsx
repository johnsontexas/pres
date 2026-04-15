"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { getPostBySlug, updatePost, generateSlug } from "@/lib/news"
import type { NewsPost } from "@/lib/news"

export default function EditPostPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [post, setPost] = useState<NewsPost | null>(null)
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [links, setLinks] = useState([
    { label: "", url: "" },
    { label: "", url: "" },
    { label: "", url: "" },
  ])
  const [isPublished, setIsPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true)
      const data = await getPostBySlug(slug)
      if (data) {
        setPost(data)
        setTitle(data.title)
        setExcerpt(data.excerpt)
        setContent(data.content)
        setImageUrl(data.imageUrl || "")
        setLinks([
          ...data.links,
          ...Array(Math.max(0, 3 - data.links.length)).fill({ label: "", url: "" }),
        ].slice(0, 3))
        setIsPublished(data.isPublished)
      }
      setLoading(false)
    }
    void loadPost()
  }, [slug])

  if (authLoading || loading) {
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

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <h2 className="text-xl font-semibold text-foreground">Post not found</h2>
        <Link
          href="/news"
          className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Back to News
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setSaving(true)
    const newSlug = title !== post.title ? generateSlug(title) : post.slug
    await updatePost(post.id, {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      isPublished,
      imageUrl: imageUrl.trim() || null,
      slug: newSlug,
      links: links
        .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
        .filter((link) => link.label && link.url),
    })
    router.push(`/news/${newSlug}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        <Link
          href={`/news/${slug}`}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          View post
        </Link>
        <h1 className="font-serif text-4xl font-bold text-foreground">
          Edit Post
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

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Optional Links
            </label>
            <div className="space-y-3">
              {links.map((link, index) => (
                <div key={index} className="grid gap-3 md:grid-cols-[1fr_2fr]">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const next = [...links]
                      next[index] = { ...next[index], label: e.target.value }
                      setLinks(next)
                    }}
                    placeholder="Link title"
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const next = [...links]
                      next[index] = { ...next[index], url: e.target.value }
                      setLinks(next)
                    }}
                    placeholder="https://example.com"
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              ))}
            </div>
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
              Published
            </label>
          </div>

          <div className="flex gap-3 border-t border-border pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href={`/news/${slug}`}
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

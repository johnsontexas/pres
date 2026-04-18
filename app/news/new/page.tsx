"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { createPost, generateSlug } from "@/lib/news"

type ImageFit = "contain" | "cover"

export default function NewPostPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageFit, setImageFit] = useState<ImageFit>("contain")
  const [imagePositionX, setImagePositionX] = useState(50)
  const [imagePositionY, setImagePositionY] = useState(50)
  const [imageSize, setImageSize] = useState("")
  const [links, setLinks] = useState([
    { label: "", url: "" },
    { label: "", url: "" },
    { label: "", url: "" },
  ])
  const [isPublished, setIsPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

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
    setError("")
    const slug = generateSlug(title)
    try {
      const post = await createPost({
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        author: user.name,
        authorId: user.id,
        publishedAt: new Date().toISOString(),
        isPublished,
        imageUrl: imageUrl.trim() || null,
        imageFit,
        imagePositionX,
        imagePositionY,
        slug,
        links: links
          .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
          .filter((link) => link.label && link.url),
      })
      router.push(post ? `/news/${post.slug}` : "/news")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save post.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        <Link
          href="/news"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All News
        </Link>
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
            {imageUrl.trim() && (
              <div className="mt-4 rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Image preview</p>
                    <p className="text-xs text-muted-foreground">
                      {imageSize || "The size will appear after the image loads."}
                    </p>
                  </div>
                  <div className="flex rounded-lg border border-border p-1 text-sm">
                    <button
                      type="button"
                      onClick={() => setImageFit("contain")}
                      className={`rounded-md px-3 py-1.5 font-medium ${
                        imageFit === "contain" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Full image
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageFit("cover")}
                      className={`rounded-md px-3 py-1.5 font-medium ${
                        imageFit === "cover" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Crop to frame
                    </button>
                  </div>
                </div>
                <div className="mt-4 aspect-[16/9] overflow-hidden rounded-lg bg-muted">
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full"
                    style={{
                      objectFit: imageFit,
                      objectPosition: `${imagePositionX}% ${imagePositionY}%`,
                    }}
                    onLoad={(event) => {
                      const image = event.currentTarget
                      setImageSize(`${image.naturalWidth} x ${image.naturalHeight}px`)
                    }}
                  />
                </div>
                {imageFit === "cover" && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="text-sm font-medium text-foreground">
                      Horizontal crop
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={imagePositionX}
                        onChange={(event) => setImagePositionX(Number(event.target.value))}
                        className="mt-2 w-full"
                      />
                    </label>
                    <label className="text-sm font-medium text-foreground">
                      Vertical crop
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={imagePositionY}
                        onChange={(event) => setImagePositionY(Number(event.target.value))}
                        className="mt-2 w-full"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}
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
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </form>
      </div>
    </div>
  )
}

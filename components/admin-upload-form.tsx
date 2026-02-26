"use client"

import { useState, useRef } from "react"
import { X, Upload, ImageIcon, Film } from "lucide-react"
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

export function AdminUploadForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [caption, setCaption] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [mediaType, setMediaType] = useState<"image" | "video">("image")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (!user?.isAdmin) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Title is required.")
      return
    }
    if (!mediaUrl.trim()) {
      setError("Media URL is required.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          caption: caption.trim() || null,
          media_url: mediaUrl.trim(),
          media_type: mediaType,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create post")
      }

      setTitle("")
      setCaption("")
      setMediaUrl("")
      setMediaType("image")
      setOpen(false)
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/25 hover:-translate-y-0.5"
      >
        <Upload className="h-4 w-4" />
        Create Post
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-card-foreground">Create News Post</h3>
        <button
          onClick={() => setOpen(false)}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <div>
          <label htmlFor="post-title" className="text-sm font-medium text-foreground">
            Title
          </label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div>
          <label htmlFor="post-caption" className="text-sm font-medium text-foreground">
            Caption
          </label>
          <textarea
            id="post-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            rows={3}
            className="mt-1.5 w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div>
          <label htmlFor="post-media-url" className="text-sm font-medium text-foreground">
            Media URL
          </label>
          <input
            id="post-media-url"
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div>
          <span className="text-sm font-medium text-foreground">Media Type</span>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setMediaType("image")}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                mediaType === "image"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:border-accent/30 hover:text-foreground"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              Image
            </button>
            <button
              type="button"
              onClick={() => setMediaType("video")}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                mediaType === "video"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:border-accent/30 hover:text-foreground"
              }`}
            >
              <Film className="h-4 w-4" />
              Video
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

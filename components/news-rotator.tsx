"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { getPublishedPosts } from "@/lib/news"
import type { NewsPost } from "@/lib/news"

const ROTATE_MS = 5000

export function NewsRotator() {
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    getPublishedPosts().then((data) => {
      if (!cancelled) {
        setPosts(data)
        setActiveIndex(0)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (posts.length <= 1) return

    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % posts.length)
    }, ROTATE_MS)

    return () => window.clearInterval(interval)
  }, [posts.length])

  const activePost = posts[activeIndex]
  const caption = useMemo(() => {
    if (!activePost) return ""
    return activePost.excerpt || activePost.content.split(/\s+/).slice(0, 24).join(" ")
  }, [activePost])

  if (!activePost) return null

  return (
    <section className="bg-background px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/news/${activePost.slug}`}
          className="group grid overflow-hidden rounded-lg border border-border bg-card md:grid-cols-[1fr_1.35fr]"
        >
          <div className="flex min-h-56 flex-col justify-center p-5 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Campaign News
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-foreground group-hover:text-primary md:text-3xl">
              {activePost.title}
            </h2>
            {caption && (
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground md:text-base">
                {caption}
              </p>
            )}
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
              Read update
              <span aria-hidden>→</span>
            </div>
            {posts.length > 1 && (
              <div className="mt-5 flex gap-2" aria-hidden>
                {posts.map((post, index) => (
                  <span
                    key={post.id}
                    className={`h-1.5 rounded-full transition-all ${
                      index === activeIndex ? "w-8 bg-primary" : "w-3 bg-muted"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="aspect-[16/9] bg-muted md:aspect-auto">
            {activePost.imageUrl ? (
              <img
                src={activePost.imageUrl}
                alt={activePost.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full min-h-56 items-center justify-center bg-primary px-8 text-center">
                <p className="font-serif text-2xl font-bold text-primary-foreground">
                  {activePost.title}
                </p>
              </div>
            )}
          </div>
        </Link>
      </div>
    </section>
  )
}

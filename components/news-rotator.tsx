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
    <section className="bg-background px-6 py-4">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/news/${activePost.slug}`}
          className="group grid overflow-hidden rounded-lg border border-border bg-card md:grid-cols-[1fr_18rem]"
        >
          <div className="flex min-h-40 flex-col justify-center p-4 md:min-h-36 md:p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Campaign News
            </p>
            <h2 className="mt-1.5 line-clamp-2 font-serif text-xl font-bold leading-tight text-foreground group-hover:text-primary md:text-2xl">
              {activePost.title}
            </h2>
            {caption && (
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground md:text-sm">
                {caption}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary md:text-sm">
              Read update
              <span aria-hidden>→</span>
            </div>
            {posts.length > 1 && (
              <div className="mt-3 flex gap-2" aria-hidden>
                {posts.map((post, index) => (
                  <span
                    key={post.id}
                    className={`h-1.5 rounded-full transition-all ${
                      index === activeIndex ? "w-6 bg-primary" : "w-2.5 bg-muted"
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
                className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.03] ${
                  activePost.imageFit === "cover" ? "object-cover" : "object-contain"
                }`}
                style={{
                  objectPosition: `${activePost.imagePositionX}% ${activePost.imagePositionY}%`,
                }}
              />
            ) : (
              <div className="flex h-full min-h-40 items-center justify-center bg-primary px-6 text-center md:min-h-36">
                <p className="font-serif text-xl font-bold text-primary-foreground">
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

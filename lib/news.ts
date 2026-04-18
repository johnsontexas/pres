import { createClient } from "@/lib/supabase/client"

export type NewsPost = {
  id: string
  title: string
  excerpt?: string | null
  content: string
  author: string
  authorId: string
  publishedAt: string
  createdAt: string
  updatedAt: string
  isPublished: boolean
  imageUrl: string | null
  imageFit: "contain" | "cover"
  imagePositionX: number
  imagePositionY: number
  slug: string
  links: NewsPostLink[]
  likes: string[]
}

export type NewsPostLink = {
  label: string
  url: string
}

function mapFromDb(row: {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  author_id: string
  published_at: string
  created_at: string
  updated_at: string
  is_published: boolean
  image_url?: string | null
  media_url?: string | null
  caption?: string | null
  image_fit?: "contain" | "cover" | null
  image_position_x?: number | string | null
  image_position_y?: number | string | null
  slug: string
  links?: NewsPostLink[] | null
  likes?: string[] | null
}): NewsPost {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt ?? row.caption ?? "",
    content: row.content,
    author: row.author,
    authorId: row.author_id,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isPublished: row.is_published,
    imageUrl: row.image_url ?? row.media_url ?? null,
    imageFit: row.image_fit === "cover" ? "cover" : "contain",
    imagePositionX: Number(row.image_position_x ?? 50),
    imagePositionY: Number(row.image_position_y ?? 50),
    slug: row.slug,
    links: row.links ?? [],
    likes: row.likes ?? [],
  }
}

export async function getPublishedPosts(): Promise<NewsPost[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("news_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  if (error || !data) {
    console.error("Error fetching news posts", error)
    return []
  }

  return data.map(mapFromDb)
}

export async function getAllPosts(): Promise<NewsPost[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("news_posts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error || !data) {
    console.error("Error fetching all posts", error)
    return []
  }

  return data.map(mapFromDb)
}

export async function getPostBySlug(slug: string): Promise<NewsPost | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("news_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  if (error || !data) {
    console.error("Error fetching post by slug", error)
    return null
  }

  return mapFromDb(data)
}

export async function createPost(
  post: Omit<NewsPost, "id" | "createdAt" | "updatedAt" | "likes">
): Promise<NewsPost | null> {
  const response = await fetch("/api/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      publishedAt: post.publishedAt,
      isPublished: post.isPublished,
      imageUrl: post.imageUrl,
      imageFit: post.imageFit,
      imagePositionX: post.imagePositionX,
      imagePositionY: post.imagePositionY,
      slug: post.slug,
      links: post.links,
    }),
  })
  const result = (await response.json().catch(async () => ({
    ok: false,
    error: await response.text().catch(() => ""),
  }))) as { ok: boolean; post?: Parameters<typeof mapFromDb>[0]; error?: string }

  if (!response.ok || !result.ok || !result.post) {
    console.error("Error creating post", result.error)
    throw new Error(result.error || `Could not create post. Server returned ${response.status}.`)
  }

  return mapFromDb(result.post)
}

export async function updatePost(
  id: string,
  updates: Partial<Omit<NewsPost, "id" | "createdAt" | "authorId" | "author">>
): Promise<NewsPost | null> {
  const response = await fetch(`/api/news/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
  const result = (await response.json()) as { ok: boolean; post?: Parameters<typeof mapFromDb>[0]; error?: string }

  if (!response.ok || !result.ok || !result.post) {
    console.error("Error updating post", result.error)
    throw new Error(result.error ?? "Could not update post")
  }

  return mapFromDb(result.post)
}

export async function deletePost(id: string): Promise<void> {
  const response = await fetch(`/api/news/${id}`, { method: "DELETE" })
  if (!response.ok) {
    console.error("Error deleting post", await response.text())
  }
}

export async function togglePostLike(id: string): Promise<NewsPost | null> {
  const response = await fetch(`/api/news/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "toggle-like" }),
  })
  const result = (await response.json()) as { ok: boolean; post?: Parameters<typeof mapFromDb>[0]; error?: string }

  if (!response.ok || !result.ok || !result.post) {
    console.error("Error toggling post like", result.error)
    return null
  }

  return mapFromDb(result.post)
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

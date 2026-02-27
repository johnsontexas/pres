import { createClient } from "@/lib/supabase/client"

export type NewsPost = {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  authorId: string
  publishedAt: string
  createdAt: string
  updatedAt: string
  isPublished: boolean
  imageUrl: string | null
  slug: string
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
  image_url: string | null
  slug: string
}): NewsPost {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    author: row.author,
    authorId: row.author_id,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isPublished: row.is_published,
    imageUrl: row.image_url,
    slug: row.slug,
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
  post: Omit<NewsPost, "id" | "createdAt" | "updatedAt">
): Promise<NewsPost | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("news_posts")
    .insert({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      author_id: post.authorId,
      published_at: post.publishedAt,
      is_published: post.isPublished,
      image_url: post.imageUrl,
      slug: post.slug,
    })
    .select("*")
    .single()

  if (error || !data) {
    console.error("Error creating post", error)
    return null
  }

  return mapFromDb(data)
}

export async function updatePost(
  id: string,
  updates: Partial<Omit<NewsPost, "id" | "createdAt" | "authorId" | "author">>
): Promise<NewsPost | null> {
  const supabase = createClient()
  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.title !== undefined) dbUpdates.title = updates.title
  if (updates.excerpt !== undefined) dbUpdates.excerpt = updates.excerpt
  if (updates.content !== undefined) dbUpdates.content = updates.content
  if (updates.publishedAt !== undefined) dbUpdates.published_at = updates.publishedAt
  if (updates.isPublished !== undefined) dbUpdates.is_published = updates.isPublished
  if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl
  if (updates.slug !== undefined) dbUpdates.slug = updates.slug

  const { data, error } = await supabase
    .from("news_posts")
    .update(dbUpdates)
    .eq("id", id)
    .select("*")
    .single()

  if (error || !data) {
    console.error("Error updating post", error)
    return null
  }

  return mapFromDb(data)
}

export async function deletePost(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("news_posts").delete().eq("id", id)
  if (error) {
    console.error("Error deleting post", error)
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

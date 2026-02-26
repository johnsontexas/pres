import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("news_posts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { title, caption, media_url, media_type } = body

  if (!title || !media_url) {
    return NextResponse.json(
      { error: "Title and media URL are required" },
      { status: 400 }
    )
  }

  const meta = user.user_metadata || {}
  const authorName = meta.full_name || meta.name || user.email?.split("@")[0] || "Unknown"

  const { data, error } = await supabase.from("news_posts").insert({
    title,
    caption: caption || null,
    media_url,
    media_type: media_type || "image",
    author_id: user.id,
    author_name: authorName,
  }).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

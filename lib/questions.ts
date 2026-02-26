import { createClient } from "@/lib/supabase/client"

export type Question = {
  id: string
  author: string
  authorId: string
  text: string
  createdAt: string
  upvotes: string[] // user IDs
  answer: string | null
}

function mapFromDb(row: {
  id: string
  author: string
  author_id: string
  text: string
  created_at: string
  upvotes: string[] | null
  answer: string | null
}): Question {
  return {
    id: row.id,
    author: row.author,
    authorId: row.author_id,
    text: row.text,
    createdAt: row.created_at,
    upvotes: row.upvotes ?? [],
    answer: row.answer,
  }
}

export async function getQuestions(): Promise<Question[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false })

  if (error || !data) {
    console.error("Error fetching questions", error)
    return []
  }

  return data.map(mapFromDb)
}

export async function addQuestion(text: string, author: string, authorId: string): Promise<Question | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("questions")
    .insert({
      author,
      author_id: authorId,
      text,
    })
    .select("*")
    .single()

  if (error || !data) {
    console.error("Error adding question", error)
    return null
  }

  return mapFromDb(data)
}

export async function deleteQuestion(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("questions").delete().eq("id", id)
  if (error) {
    console.error("Error deleting question", error)
  }
}

export async function toggleUpvote(questionId: string, userId: string): Promise<void> {
  const supabase = createClient()

  const { data: row, error } = await supabase
    .from("questions")
    .select("id, upvotes")
    .eq("id", questionId)
    .single()

  if (error || !row) {
    console.error("Error loading question for upvote", error)
    return
  }

  const current = (row.upvotes as string[] | null) ?? []
  const hasUpvoted = current.includes(userId)
  const next = hasUpvoted ? current.filter((id) => id !== userId) : [...current, userId]

  const { error: updateError } = await supabase
    .from("questions")
    .update({ upvotes: next })
    .eq("id", questionId)

  if (updateError) {
    console.error("Error updating upvotes", updateError)
  }
}

export async function answerQuestion(questionId: string, answer: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("questions")
    .update({ answer })
    .eq("id", questionId)

  if (error) {
    console.error("Error saving answer", error)
  }
}

export async function getQuestion(id: string): Promise<Question | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    console.error("Error fetching question", error)
    return null
  }

  return mapFromDb(data)
}

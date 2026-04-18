export type Question = {
  id: string
  author: string
  authorId: string
  text: string
  createdAt: string
  upvotes: string[] // user IDs
  answer: string | null
  isAnonymous: boolean
  status: "approved" | "pending" | "rejected"
}

function mapFromDb(row: {
  id: string
  author: string
  author_id: string
  text: string
  created_at: string
  upvotes: string[] | null
  answer: string | null
  is_anonymous?: boolean | null
  status?: "approved" | "pending" | "rejected" | null
}): Question {
  return {
    id: row.id,
    author: row.author,
    authorId: row.author_id,
    text: row.text,
    createdAt: row.created_at,
    upvotes: row.upvotes ?? [],
    answer: row.answer,
    isAnonymous: row.is_anonymous ?? false,
    status: row.status ?? "approved",
  }
}

export async function getQuestions(): Promise<Question[]> {
  const response = await fetch("/api/questions")
  const result = (await response.json()) as {
    ok: boolean
    questions?: Parameters<typeof mapFromDb>[0][]
    error?: string
  }

  if (!response.ok || !result.ok || !result.questions) {
    console.error("Error fetching questions", result.error)
    return []
  }

  return result.questions.map(mapFromDb)
}

export async function addQuestion(
  text: string,
  author: string,
  authorId: string,
  isAnonymous: boolean
): Promise<Question | null> {
  const response = await fetch("/api/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, author, authorId, isAnonymous }),
  })
  const result = (await response.json()) as {
    ok: boolean
    question?: Parameters<typeof mapFromDb>[0]
    error?: string
  }

  if (!response.ok || !result.ok || !result.question) {
    console.error("Error adding question", result.error)
    throw new Error(result.error ?? "Could not submit question")
  }

  return mapFromDb(result.question)
}

export async function deleteQuestion(id: string): Promise<void> {
  const response = await fetch(`/api/questions/${id}`, { method: "DELETE" })
  if (!response.ok) {
    console.error("Error deleting question", await response.text())
  }
}

export async function toggleUpvote(questionId: string, userId: string): Promise<void> {
  void userId
  const response = await fetch(`/api/questions/${questionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "toggle-upvote" }),
  })
  if (!response.ok) {
    console.error("Error updating upvotes", await response.text())
  }
}

export async function answerQuestion(questionId: string, answer: string): Promise<void> {
  const response = await fetch(`/api/questions/${questionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "answer", answer }),
  })
  if (!response.ok) {
    console.error("Error saving answer", await response.text())
  }
}

export async function getQuestion(id: string): Promise<Question | null> {
  const response = await fetch(`/api/questions/${id}`)
  const result = (await response.json()) as {
    ok: boolean
    question?: Parameters<typeof mapFromDb>[0]
    error?: string
  }

  if (!response.ok || !result.ok || !result.question) {
    console.error("Error fetching question", result.error)
    return null
  }

  return mapFromDb(result.question)
}

export async function moderateQuestion(
  questionId: string,
  status: "approved" | "pending" | "rejected"
): Promise<void> {
  const response = await fetch(`/api/questions/${questionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "moderate", status }),
  })
  if (!response.ok) {
    console.error("Error moderating question", await response.text())
  }
}

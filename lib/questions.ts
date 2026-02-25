export type Question = {
  id: string
  author: string
  authorId: string
  text: string
  createdAt: string
  upvotes: string[] // user IDs
  answer: string | null
}

const STORAGE_KEY = "campaign-questions"

export function getQuestions(): Question[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveQuestions(questions: Question[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
}

export function addQuestion(text: string, author: string, authorId: string): Question {
  const questions = getQuestions()
  const newQuestion: Question = {
    id: crypto.randomUUID(),
    author,
    authorId,
    text,
    createdAt: new Date().toISOString(),
    upvotes: [],
    answer: null,
  }
  questions.unshift(newQuestion)
  saveQuestions(questions)
  return newQuestion
}

export function deleteQuestion(id: string) {
  const questions = getQuestions().filter((q) => q.id !== id)
  saveQuestions(questions)
}

export function toggleUpvote(questionId: string, userId: string) {
  const questions = getQuestions()
  const question = questions.find((q) => q.id === questionId)
  if (!question) return

  const idx = question.upvotes.indexOf(userId)
  if (idx === -1) {
    question.upvotes.push(userId)
  } else {
    question.upvotes.splice(idx, 1)
  }

  saveQuestions(questions)
}

export function answerQuestion(questionId: string, answer: string) {
  const questions = getQuestions()
  const question = questions.find((q) => q.id === questionId)
  if (!question) return

  question.answer = answer
  saveQuestions(questions)
}

export function getQuestion(id: string): Question | undefined {
  return getQuestions().find((q) => q.id === id)
}

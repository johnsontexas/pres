import { createClient } from "@/lib/supabase/client"

export type SignatureStatus = "pending" | "approved" | "rejected"

export type VoteSignature = {
  id: string
  userId: string
  authorName: string
  imagePath: string
  imageUrl: string
  color: string
  x: number
  y: number
  width: number
  rotation: number
  status: SignatureStatus
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}

type VoteSignatureRow = {
  id: string
  user_id: string
  author_name: string
  image_path: string
  color: string
  x: number | string
  y: number | string
  width: number | string
  rotation: number | string
  status: SignatureStatus
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

const BUCKET = "vote-signatures"

function publicUrlForPath(path: string) {
  const supabase = createClient()
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function mapFromDb(row: VoteSignatureRow): VoteSignature {
  return {
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name,
    imagePath: row.image_path,
    imageUrl: publicUrlForPath(row.image_path),
    color: row.color,
    x: Number(row.x),
    y: Number(row.y),
    width: Number(row.width),
    rotation: Number(row.rotation),
    status: row.status,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getApprovedSignatures(): Promise<VoteSignature[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("vote_signatures")
    .select("*")
    .eq("status", "approved")
    .order("updated_at", { ascending: true })

  if (error || !data) {
    console.error("Error fetching approved signatures", error)
    return []
  }

  return (data as VoteSignatureRow[]).map(mapFromDb)
}

export async function getMySignature(userId: string): Promise<VoteSignature | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("vote_signatures")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !data) {
    if (error) console.error("Error fetching your signature", error)
    return null
  }

  return mapFromDb(data as VoteSignatureRow)
}

export async function getAllSignaturesForAdmin(): Promise<VoteSignature[]> {
  const response = await fetch("/api/vote-signatures/admin")
  const result = (await response.json()) as {
    ok: boolean
    signatures?: VoteSignatureRow[]
    error?: string
  }

  if (!response.ok || !result.ok || !result.signatures) {
    console.error("Error fetching signatures for admin", result.error)
    return []
  }

  return result.signatures.map(mapFromDb)
}

export async function uploadSignaturePng(userId: string, blob: Blob) {
  const supabase = createClient()
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.png`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/png",
    cacheControl: "31536000",
  })

  if (error) {
    console.error("Error uploading signature PNG", error)
    throw error
  }

  return path
}

export async function saveSignatureImage(input: {
  userId: string
  authorName: string
  imagePath: string
  color: string
  isAdmin?: boolean
}) {
  if (input.isAdmin) {
    const response = await fetch("/api/vote-signatures/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const result = (await response.json()) as {
      ok: boolean
      signature?: VoteSignatureRow
      error?: string
    }

    if (!response.ok || !result.ok || !result.signature) {
      throw new Error(result.error ?? "Error saving admin signature")
    }

    return mapFromDb(result.signature)
  }

  const supabase = createClient()
  const { data: existing } = await supabase
    .from("vote_signatures")
    .select("id, x, y, width, rotation")
    .eq("user_id", input.userId)
    .maybeSingle()

  const payload = {
    user_id: input.userId,
    author_name: input.authorName,
    image_path: input.imagePath,
    color: input.color,
    x: Number(existing?.x ?? 0.4),
    y: Number(existing?.y ?? 0.42),
    width: Number(existing?.width ?? 0.18),
    rotation: Number(existing?.rotation ?? 0),
    status: "pending" as SignatureStatus,
  }

  const { data, error } = await supabase
    .from("vote_signatures")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single()

  if (error || !data) {
    console.error("Error saving signature", error)
    throw error
  }

  return mapFromDb(data as VoteSignatureRow)
}

export async function updateSignaturePlacement(
  id: string,
  placement: Pick<VoteSignature, "x" | "y" | "width" | "rotation" | "color">
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("vote_signatures")
    .update(placement)
    .eq("id", id)
    .select("*")
    .single()

  if (error || !data) {
    console.error("Error updating signature placement", error)
    throw error
  }

  return mapFromDb(data as VoteSignatureRow)
}

export async function moderateSignature(
  id: string,
  status: Extract<SignatureStatus, "approved" | "rejected">
) {
  const response = await fetch("/api/vote-signatures/admin", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  })
  const result = (await response.json()) as {
    ok: boolean
    error?: string
  }

  if (!response.ok || !result.ok) {
    console.error("Error moderating signature", result.error)
    throw new Error(result.error ?? "Error moderating signature")
  }
}

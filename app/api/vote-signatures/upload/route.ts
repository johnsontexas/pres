import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const BUCKET = "vote-signatures"

async function ensureBucket() {
  const admin = createAdminClient()
  const { error } = await admin.storage.getBucket(BUCKET)

  if (!error) return admin

  const { error: createError } = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 1024 * 1024,
    allowedMimeTypes: ["image/png"],
  })

  if (createError && createError.message !== "The resource already exists") {
    throw createError
  }

  return admin
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Missing signature file" }, { status: 400 })
    }
    if (file.type !== "image/png") {
      return NextResponse.json({ ok: false, error: "Signature must be a PNG" }, { status: 400 })
    }
    if (file.size > 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "Please keep your signature under 1 MB" },
        { status: 400 }
      )
    }

    const admin = await ensureBucket()
    const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.png`
    const { error } = await admin.storage.from(BUCKET).upload(path, file, {
      contentType: "image/png",
      cacheControl: "31536000",
    })

    if (error) throw error

    return NextResponse.json({ ok: true, path })
  } catch (err) {
    console.error("vote-signatures upload error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not upload signature" },
      { status: 500 }
    )
  }
}

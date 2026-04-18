import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getSignedInUser, isAdminEmail, requireAdmin } from "@/lib/server-auth"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getSignedInUser()
    const userIsAdmin = !("error" in auth) && (await isAdminEmail(auth.email))
    const admin = createAdminClient()
    const { data, error } = await admin.from("questions").select("*").eq("id", id).single()

    if (error) throw error
    if (!userIsAdmin && data.status && data.status !== "approved") {
      return NextResponse.json({ ok: false, error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true, question: data })
  } catch (err) {
    console.error("question get error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not load question" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await request.json()) as {
      action?: "toggle-upvote" | "answer" | "moderate"
      answer?: unknown
      status?: "approved" | "rejected" | "pending"
    }
    const admin = createAdminClient()

    if (body.action === "toggle-upvote") {
      const auth = await getSignedInUser()
      if ("error" in auth) {
        return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
      }

      const { data: row, error: loadError } = await admin
        .from("questions")
        .select("id, upvotes")
        .eq("id", id)
        .single()

      if (loadError) throw loadError
      const current = (row.upvotes as string[] | null) ?? []
      const next = current.includes(auth.user.id)
        ? current.filter((userId) => userId !== auth.user.id)
        : [...current, auth.user.id]

      const { data, error } = await admin
        .from("questions")
        .update({ upvotes: next })
        .eq("id", id)
        .select("*")
        .single()

      if (error) throw error
      return NextResponse.json({ ok: true, question: data })
    }

    const auth = await requireAdmin()
    if ("error" in auth) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
    }

    if (body.action === "answer") {
      const answer = String(body.answer ?? "").trim()
      if (!answer) {
        return NextResponse.json({ ok: false, error: "Answer is required" }, { status: 400 })
      }
      const { data, error } = await admin
        .from("questions")
        .update({ answer })
        .eq("id", id)
        .select("*")
        .single()

      if (error) throw error
      return NextResponse.json({ ok: true, question: data })
    }

    if (body.action === "moderate") {
      if (body.status !== "approved" && body.status !== "rejected" && body.status !== "pending") {
        return NextResponse.json({ ok: false, error: "Invalid question status" }, { status: 400 })
      }
      const { data, error } = await admin
        .from("questions")
        .update({
          status: body.status,
          reviewed_by: auth.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single()

      if (error) throw error
      return NextResponse.json({ ok: true, question: data })
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 })
  } catch (err) {
    console.error("question patch error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not update question" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if ("error" in auth) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const admin = createAdminClient()
    const { error } = await admin.from("questions").delete().eq("id", id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("question delete error:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not delete question" },
      { status: 500 }
    )
  }
}

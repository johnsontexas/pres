"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, Lock, PenLine, Upload, X } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import {
  getAllSignaturesForAdmin,
  getApprovedSignatures,
  getMySignature,
  moderateSignature,
  saveSignatureImage,
  updateSignaturePlacement,
  uploadSignaturePng,
} from "@/lib/vote-signatures"
import type { VoteSignature } from "@/lib/vote-signatures"
import { CAMPAIGN_SLOGAN } from "@/lib/campaign"

const SIGNATURE_COLORS = ["#1B5E20", "#111827", "#0F766E", "#B91C1C", "#7C2D12"]
const DEFAULT_PLACEMENT = {
  x: 0.18,
  y: 0.82,
  width: 0.18,
  rotation: 0,
  color: SIGNATURE_COLORS[0],
}

const BLOCKED_ZONES = [
  { x1: 0.06, y1: 0.18, x2: 0.45, y2: 0.29 },
  { x1: 0.06, y1: 0.31, x2: 0.57, y2: 0.59 },
  { x1: 0.06, y1: 0.63, x2: 0.62, y2: 0.77 },
  { x1: 0.62, y1: 0.14, x2: 0.96, y2: 0.9 },
]

type CaptureMode = "draw" | "upload"

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function signatureRect(placement: Pick<VoteSignature, "x" | "y" | "width">) {
  const height = placement.width / 3
  return {
    x1: placement.x - placement.width / 2,
    x2: placement.x + placement.width / 2,
    y1: placement.y - height / 2,
    y2: placement.y + height / 2,
  }
}

function overlaps(
  a: { x1: number; y1: number; x2: number; y2: number },
  b: { x1: number; y1: number; x2: number; y2: number }
) {
  return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1
}

function normalizePlacement<T extends Pick<VoteSignature, "x" | "y" | "width">>(
  placement: T
): T {
  const height = placement.width / 3
  let next = {
    ...placement,
    x: clamp(placement.x, placement.width / 2 + 0.02, 1 - placement.width / 2 - 0.02),
    y: clamp(placement.y, height / 2 + 0.03, 1 - height / 2 - 0.04),
  }

  for (const zone of BLOCKED_ZONES) {
    const rect = signatureRect(next)
    if (!overlaps(rect, zone)) continue

    const candidates = [
      { ...next, x: zone.x1 - next.width / 2 - 0.018 },
      { ...next, x: zone.x2 + next.width / 2 + 0.018 },
      { ...next, y: zone.y1 - height / 2 - 0.018 },
      { ...next, y: zone.y2 + height / 2 + 0.018 },
    ].map((candidate) => ({
      ...candidate,
      x: clamp(candidate.x, next.width / 2 + 0.02, 1 - next.width / 2 - 0.02),
      y: clamp(candidate.y, height / 2 + 0.03, 1 - height / 2 - 0.04),
    }))

    const validCandidates = candidates.filter((candidate) =>
      BLOCKED_ZONES.every((blockedZone) => !overlaps(signatureRect(candidate), blockedZone))
    )

    const choices = validCandidates.length > 0 ? validCandidates : candidates
    next = choices.reduce((closest, candidate) => {
      const closestDistance = Math.hypot(closest.x - placement.x, closest.y - placement.y)
      const candidateDistance = Math.hypot(candidate.x - placement.x, candidate.y - placement.y)
      return candidateDistance < closestDistance ? candidate : closest
    }, choices[0])
  }

  return next
}

function signatureStyle(signature: VoteSignature, isMine: boolean): CSSProperties {
  return {
    left: `${signature.x * 100}%`,
    top: `${signature.y * 100}%`,
    width: `${signature.width * 100}%`,
    aspectRatio: "3 / 1",
    backgroundColor: signature.color,
    maskImage: `url(${signature.imageUrl})`,
    WebkitMaskImage: `url(${signature.imageUrl})`,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    opacity: signature.status === "approved" ? 0.92 : 0.55,
    transform: `translate(-50%, -50%) rotate(${signature.rotation}deg)`,
    cursor: isMine ? "grab" : "default",
  }
}

async function blobFromCanvas(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
  if (!blob) throw new Error("Could not create signature PNG.")
  return blob
}

async function fileToSignatureBlob(file: File, color: string) {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement("canvas")
  canvas.width = 640
  canvas.height = 240
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) throw new Error("Could not prepare uploaded signature.")

  const scale = Math.min(canvas.width / bitmap.width, canvas.height / bitmap.height)
  const width = bitmap.width * scale
  const height = bitmap.height * scale
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const rgb = color.match(/\w\w/g)?.map((part) => parseInt(part, 16)) ?? [27, 94, 32]

  for (let i = 0; i < image.data.length; i += 4) {
    const r = image.data[i]
    const g = image.data[i + 1]
    const b = image.data[i + 2]
    const sourceAlpha = image.data[i + 3] / 255
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    const inkAlpha = clamp((1 - luminance) * 2.2 * sourceAlpha, 0, 1)
    image.data[i] = rgb[0]
    image.data[i + 1] = rgb[1]
    image.data[i + 2] = rgb[2]
    image.data[i + 3] = Math.round(inkAlpha * 255)
  }

  ctx.putImageData(image, 0, 0)
  return blobFromCanvas(canvas)
}

export function SignYourVote() {
  const { user, isLoading, signInWithGoogle } = useAuth()
  const boardRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null)
  const placementRef = useRef(DEFAULT_PLACEMENT)

  const [approved, setApproved] = useState<VoteSignature[]>([])
  const [mine, setMine] = useState<VoteSignature | null>(null)
  const [adminSignatures, setAdminSignatures] = useState<VoteSignature[]>([])
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [isCaptureOpen, setIsCaptureOpen] = useState(false)
  const [captureMode, setCaptureMode] = useState<CaptureMode>("draw")
  const [selectedColor, setSelectedColor] = useState(SIGNATURE_COLORS[0])
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [draftPlacement, setDraftPlacement] = useState(DEFAULT_PLACEMENT)

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    const [approvedRows, myRow, adminRows] = await Promise.all([
      getApprovedSignatures(),
      user ? getMySignature(user.id) : Promise.resolve(null),
      user?.isAdmin ? getAllSignaturesForAdmin() : Promise.resolve([]),
    ])
    let currentUserSignature = myRow
    if (user?.isAdmin && currentUserSignature && currentUserSignature.status !== "approved") {
      await moderateSignature(currentUserSignature.id, "approved")
      currentUserSignature = {
        ...currentUserSignature,
        status: "approved",
        reviewedAt: new Date().toISOString(),
      }
    }

    const visibleApproved = currentUserSignature
      ? [
          ...approvedRows.filter((signature) => signature.id !== currentUserSignature?.id),
          ...(currentUserSignature.status === "approved" ? [currentUserSignature] : []),
        ]
      : approvedRows

    setApproved(visibleApproved)
    setMine(currentUserSignature)
    setAdminSignatures(adminRows.filter((signature) => signature.id !== currentUserSignature?.id))
    if (currentUserSignature) {
      const nextPlacement = normalizePlacement({
        x: currentUserSignature.x,
        y: currentUserSignature.y,
        width: currentUserSignature.width,
        rotation: currentUserSignature.rotation,
        color: currentUserSignature.color,
      })
      placementRef.current = nextPlacement
      setDraftPlacement(nextPlacement)
      setSelectedColor(currentUserSignature.color)
    }
    setIsRefreshing(false)
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!isCaptureOpen || captureMode !== "draw") return
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    const rect = canvas.getBoundingClientRect()
    const scale = window.devicePixelRatio || 1
    canvas.width = rect.width * scale
    canvas.height = rect.height * scale
    context.scale(scale, scale)
    context.lineCap = "round"
    context.lineJoin = "round"
    context.lineWidth = 4
    context.strokeStyle = selectedColor
    context.clearRect(0, 0, rect.width, rect.height)
  }, [captureMode, isCaptureOpen, selectedColor])

  const displayedSignatures = useMemo(() => {
    const withoutMine = approved.filter((signature) => signature.userId !== mine?.userId)
    return mine ? [...withoutMine, mine] : withoutMine
  }, [approved, mine])

  const pendingSignatures = adminSignatures.filter((signature) => signature.status === "pending")

  const canvasPoint = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const startDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const context = canvasRef.current?.getContext("2d")
    if (!context) return
    const point = canvasPoint(event)
    drawingRef.current = true
    context.beginPath()
    context.moveTo(point.x, point.y)
  }

  const draw = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const context = canvasRef.current?.getContext("2d")
    if (!context) return
    const point = canvasPoint(event)
    context.lineTo(point.x, point.y)
    context.stroke()
  }

  const stopDrawing = () => {
    drawingRef.current = false
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return
    const rect = canvas.getBoundingClientRect()
    context.clearRect(0, 0, rect.width, rect.height)
  }

  const saveBlob = async (blob: Blob) => {
    if (!user) return
    setIsSaving(true)
    setError("")
    setMessage("")
    try {
      if (blob.size > 1024 * 1024) {
        setError("Please keep your signature under 1 MB.")
        return
      }
      const imagePath = await uploadSignaturePng(user.id, blob)
      const saved = await saveSignatureImage({
        userId: user.id,
        authorName: user.name,
        imagePath,
        color: selectedColor,
        isAdmin: user.isAdmin,
      })
      setMine(saved)
      setMessage(
        user.isAdmin
          ? "Signature saved and approved."
          : "Signature saved. An admin will approve it before it appears for everyone."
      )
      setIsCaptureOpen(false)
      await refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? `Could not save your signature: ${err.message}`
          : "Could not save your signature. Please try again."
      )
    } finally {
      setIsSaving(false)
    }
  }

  const saveDrawnSignature = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    await saveBlob(await blobFromCanvas(canvas))
  }

  const saveUploadedSignature = async (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Upload an image file of your signature.")
      return
    }
    try {
      await saveBlob(await fileToSignatureBlob(file, selectedColor))
    } catch {
      setError("Could not read that image. A PNG or JPG works best.")
    }
  }

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>, signature: VoteSignature) => {
    if (!mine || signature.id !== mine.id) return
    const board = boardRef.current
    if (!board) return
    const rect = board.getBoundingClientRect()
    dragRef.current = {
      offsetX: event.clientX - rect.left - signature.x * rect.width,
      offsetY: event.clientY - rect.top - signature.y * rect.height,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const dragSignature = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !mine) return
    const board = boardRef.current
    if (!board) return
    const rect = board.getBoundingClientRect()
    const x = (event.clientX - rect.left - dragRef.current.offsetX) / rect.width
    const y = (event.clientY - rect.top - dragRef.current.offsetY) / rect.height
    const next = normalizePlacement({
      ...mine,
      x,
      y,
    })
    const nextPlacement = { ...placementRef.current, x: next.x, y: next.y }
    placementRef.current = nextPlacement
    setMine(next)
    setDraftPlacement(nextPlacement)
  }

  const endDrag = async () => {
    if (!dragRef.current || !mine) return
    dragRef.current = null
    await savePlacement(mine)
  }

  const savePlacement = async (signature = mine) => {
    if (!signature) return
    setIsSaving(true)
    setError("")
    try {
      const updated = await updateSignaturePlacement(signature.id, {
        x: placementRef.current.x,
        y: placementRef.current.y,
        width: placementRef.current.width,
        rotation: placementRef.current.rotation,
        color: placementRef.current.color,
      })
      setMine(updated)
      setMessage("Your signature position is saved.")
      await refresh()
    } catch {
      setError("Could not save the placement.")
    } finally {
      setIsSaving(false)
    }
  }

  const updateDraft = (next: Partial<typeof draftPlacement>) => {
    const merged = normalizePlacement({ ...placementRef.current, ...next })
    placementRef.current = merged
    setDraftPlacement(merged)
    setMine((current) => (current ? { ...current, ...merged } : current))
  }

  const handleModeration = async (
    signature: VoteSignature,
    status: "approved" | "rejected"
  ) => {
    if (!user?.isAdmin) return
    setIsSaving(true)
    setError("")
    try {
      await moderateSignature(signature.id, status)
      await refresh()
      setMessage(status === "approved" ? "Signature approved." : "Signature rejected.")
    } catch {
      setError("Could not update that signature. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="bg-secondary/45 px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Sign your vote
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Sign your vote with Daniel Johnson
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            Add your signature once, place it around the top of the page, and keep your spot
            exactly where you want it.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto pb-2">
          <div
            ref={boardRef}
            className="relative mx-auto aspect-[1000/560] min-w-[720px] max-w-[1000px] overflow-hidden rounded-lg border border-primary/30 bg-primary shadow-sm"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 20% 20%, oklch(0.55 0.12 145 / 0.35), transparent 55%), oklch(0.32 0.12 145)",
            }}
            aria-label="Hero signature placement preview"
          >
            <div className="absolute left-[6%] top-[18%] max-w-[39%] rounded-lg border border-primary-foreground/25 bg-primary-foreground/5 px-4 py-2 text-xs font-medium tracking-wide text-primary-foreground/90">
              Running for <span className="text-accent">House Council President</span>
            </div>
            <div className="absolute left-[6%] top-[32%] max-w-[50%]">
              <div className="font-display text-5xl font-bold leading-[1.08] tracking-tight text-primary-foreground">
                Vote <span className="text-accent">Daniel Johnson</span>
              </div>
              <p className="mt-4 max-w-[92%] font-serif text-lg font-semibold leading-relaxed text-primary-foreground/95">
                {CAMPAIGN_SLOGAN}
              </p>
            </div>
            <div className="absolute left-[6%] top-[64%] flex max-w-[56%] flex-wrap gap-3">
              <div className="rounded-lg bg-primary-foreground px-5 py-2.5 text-xs font-semibold text-primary shadow-sm">
                See my platform
              </div>
              <div className="rounded-lg border border-primary-foreground/35 bg-primary-foreground/5 px-5 py-2.5 text-xs font-semibold text-primary-foreground">
                Ask me a question
              </div>
              <div className="rounded-lg border border-accent/50 bg-accent/15 px-5 py-2.5 text-xs font-semibold text-primary-foreground">
                Join the campaign
              </div>
            </div>
            <div className="absolute bottom-[9%] right-[7%] w-[29%]">
              <Image
                src="/images/candidate.png"
                alt="Daniel Johnson"
                width={360}
                height={450}
                className="h-auto w-full object-contain"
                priority={false}
              />
            </div>
            {displayedSignatures.map((signature) => {
              const isMine = signature.id === mine?.id
              return (
                <div
                  key={signature.id}
                  className={`absolute touch-none transition-opacity ${
                    isMine ? "outline outline-2 outline-offset-4 outline-primary/25" : ""
                  }`}
                  style={signatureStyle(signature, isMine)}
                  title={signature.authorName}
                  onPointerDown={(event) => beginDrag(event, signature)}
                  onPointerMove={dragSignature}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                />
              )
            })}
            {isRefreshing && (
              <div className="absolute inset-0 grid place-items-center bg-background/55 text-sm text-muted-foreground">
                Loading signatures...
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto mt-7 max-w-3xl rounded-lg border border-border bg-card p-5 shadow-sm">
          {!isLoading && !user && (
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="font-semibold text-foreground">Add your signature</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in first so every person gets one signature.
                </p>
              </div>
              <button
                type="button"
                onClick={() => signInWithGoogle("/")}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Sign in to sign
              </button>
            </div>
          )}

          {user && (
            <div className="space-y-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {mine ? "Your signature" : "Write your signature"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {mine
                      ? mine.status === "approved"
                        ? "Approved. Drag it on the board and save your placement anytime."
                        : mine.status === "pending"
                          ? "Waiting for admin approval. You can still place it now."
                          : "Rejected. Write or upload a new signature for approval."
                      : "Draw with your screen or mouse, or upload an image."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCaptureMode("draw")
                      setIsCaptureOpen(true)
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <PenLine className="h-4 w-4" />
                    Write your signature
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCaptureMode("upload")
                      setIsCaptureOpen(true)
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Upload className="h-4 w-4" />
                    Upload signature
                  </button>
                </div>
              </div>
              <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary">
                {user.isAdmin
                  ? "Admin signatures are approved automatically. Student signatures still need your approval before they appear for everyone."
                  : "Note: every new or replaced signature must be approved by an admin before it appears for everyone."}
              </p>

              {mine && (
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="text-sm font-medium text-foreground">
                      Size
                      <input
                        type="range"
                        min="0.08"
                        max="0.28"
                        step="0.01"
                        value={draftPlacement.width}
                        onChange={(event) => updateDraft({ width: Number(event.target.value) })}
                        className="mt-2 w-full"
                      />
                    </label>
                    <label className="text-sm font-medium text-foreground">
                      Tilt
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        step="1"
                        value={draftPlacement.rotation}
                        onChange={(event) => updateDraft({ rotation: Number(event.target.value) })}
                        className="mt-2 w-full"
                      />
                    </label>
                    <div>
                      <p className="text-sm font-medium text-foreground">Color</p>
                      <div className="mt-2 flex gap-2">
                        {SIGNATURE_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => updateDraft({ color })}
                            className={`h-8 w-8 rounded-lg border ${
                              draftPlacement.color === color
                                ? "border-foreground"
                                : "border-border"
                            }`}
                            style={{ backgroundColor: color }}
                            aria-label={`Use ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => savePlacement()}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    <Lock className="h-4 w-4" />
                    Lock in placement
                  </button>
                </div>
              )}

              {message && <p className="text-sm font-medium text-primary">{message}</p>}
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            </div>
          )}
        </div>

        {user?.isAdmin && pendingSignatures.length > 0 && (
          <div className="mx-auto mt-6 max-w-3xl rounded-lg border border-border bg-card p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">Signatures waiting for approval</h3>
            <div className="mt-4 space-y-3">
              {pendingSignatures.map((signature) => (
                <div
                  key={signature.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{signature.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(signature.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div
                    className="h-12 w-40"
                    style={{
                      backgroundColor: signature.color,
                      maskImage: `url(${signature.imageUrl})`,
                      WebkitMaskImage: `url(${signature.imageUrl})`,
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleModeration(signature, "approved")}
                      disabled={isSaving}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeration(signature, "rejected")}
                      disabled={isSaving}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground disabled:opacity-60"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && !user && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Already signed in somewhere else?{" "}
            <Link href="/signin?redirect=/" className="font-medium text-primary hover:underline">
              Continue here
            </Link>
          </p>
        )}
      </div>

      {isCaptureOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/45 px-4 py-6">
          <div className="w-full max-w-2xl rounded-lg border border-border bg-background p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {captureMode === "draw" ? "Write your signature" : "Upload your signature"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {user?.isAdmin
                    ? "Your admin signature will be approved automatically."
                    : "New signatures wait for admin approval before they appear for everyone."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCaptureOpen(false)}
                className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground"
                aria-label="Close signature editor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {SIGNATURE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-8 w-8 rounded-lg border ${
                    selectedColor === color ? "border-foreground" : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Draw with ${color}`}
                />
              ))}
            </div>

            {captureMode === "draw" ? (
              <>
                <canvas
                  ref={canvasRef}
                  className="mt-4 h-56 w-full touch-none rounded-lg border border-input bg-white"
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerCancel={stopDrawing}
                  onPointerLeave={stopDrawing}
                />
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={saveDrawnSignature}
                    disabled={isSaving}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    Save signature
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-border p-8 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Choose a PNG or JPG. It will be converted into a clean PNG.
                </p>
                <label className="mt-4 inline-flex cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  Choose file
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(event) => saveUploadedSignature(event.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            )}

            {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}
          </div>
        </div>
      )}
    </section>
  )
}

"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, Lock, PenLine, Share2, X } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  getAllSignaturesForAdmin,
  getApprovedSignatures,
  getMySignature,
  getReferralState,
  moderateSignature,
  saveReferralList,
  saveSignatureImage,
  updateSignaturePlacement,
  uploadSignaturePng,
} from "@/lib/vote-signatures"
import type { ReferralState } from "@/lib/vote-signatures"
import type { VoteSignature } from "@/lib/vote-signatures"
import { CAMPAIGN_SLOGAN } from "@/lib/campaign"
import { getSignatureZones, normalizeSignaturePlacement } from "@/lib/signature-layout"

const SIGNATURE_COLORS = ["#FFFFFF", "#1B5E20", "#B91C1C", "#FACC15"]
const DEFAULT_PLACEMENT = {
  x: 0.18,
  y: 0.82,
  width: 0.18,
  rotation: 0,
  color: SIGNATURE_COLORS[0],
  glowEnabled: false,
}

function validSignatureColor(color: string) {
  return SIGNATURE_COLORS.includes(color) ? color : "#FFFFFF"
}

function signaturePlacementStyle(signature: VoteSignature, canDrag: boolean): CSSProperties {
  return {
    left: `${signature.x * 100}%`,
    top: `${signature.y * 100}%`,
    width: `${signature.width * 100}%`,
    aspectRatio: "3 / 1",
    transform: `translate(-50%, -50%) rotate(${signature.rotation}deg)`,
    cursor: canDrag ? "grab" : "default",
  }
}

function signatureInkStyle(signature: VoteSignature): CSSProperties {
  const color = validSignatureColor(signature.color)
  return {
    backgroundColor: color,
    maskImage: `url(${signature.imageUrl})`,
    WebkitMaskImage: `url(${signature.imageUrl})`,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    opacity: signature.status === "approved" ? 0.92 : 0.55,
  }
}

function signatureGlowStyle(signature: VoteSignature): CSSProperties {
  const color = validSignatureColor(signature.color)
  return {
    backgroundColor: color,
    maskImage: `url(${signature.imageUrl})`,
    WebkitMaskImage: `url(${signature.imageUrl})`,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskPosition: "center",
    WebkitMaskPosition: "center",
  }
}

async function blobFromCanvas(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
  if (!blob) throw new Error("Could not create signature PNG.")
  return blob
}

export function SignYourVote() {
  const { user, isLoading, signInWithGoogle } = useAuth()
  const isMobile = useIsMobile()
  const signatureZones = useMemo(() => getSignatureZones(isMobile), [isMobile])
  const boardRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const placementRef = useRef(DEFAULT_PLACEMENT)

  const [approved, setApproved] = useState<VoteSignature[]>([])
  const [mine, setMine] = useState<VoteSignature | null>(null)
  const [adminSignatures, setAdminSignatures] = useState<VoteSignature[]>([])
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [isPlacementOpen, setIsPlacementOpen] = useState(false)
  const [isCaptureOpen, setIsCaptureOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(SIGNATURE_COLORS[0])
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [draftPlacement, setDraftPlacement] = useState(DEFAULT_PLACEMENT)
  const [referralState, setReferralState] = useState<ReferralState>({
    emails: [],
    credits: 0,
    glowUnlocked: false,
    results: [],
  })
  const [referralEmails, setReferralEmails] = useState(["", "", "", "", ""])

  const normalizePlacement = useCallback(
    <T extends Pick<VoteSignature, "x" | "y" | "width">>(placement: T) =>
      normalizeSignaturePlacement(placement, signatureZones),
    [signatureZones]
  )

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
    setAdminSignatures(adminRows)
    if (currentUserSignature) {
      const nextPlacement = normalizePlacement({
        x: currentUserSignature.x,
        y: currentUserSignature.y,
        width: currentUserSignature.width,
        rotation: currentUserSignature.rotation,
        color: validSignatureColor(currentUserSignature.color),
        glowEnabled: currentUserSignature.glowEnabled,
      })
      placementRef.current = nextPlacement
      setDraftPlacement(nextPlacement)
      setSelectedColor(validSignatureColor(currentUserSignature.color))
    }
    setIsRefreshing(false)
  }, [normalizePlacement, user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!isCaptureOpen) return
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
  }, [isCaptureOpen, selectedColor])

  useEffect(() => {
    if (!user) return

    getReferralState()
      .then((state) => {
        setReferralState(state)
        setReferralEmails([
          ...state.emails,
          ...Array(Math.max(0, 5 - state.emails.length)).fill(""),
        ].slice(0, 5))
      })
      .catch(() => {})
  }, [user])

  const displayedSignatures = useMemo(() => {
    const normalizeRows = (rows: VoteSignature[]) =>
      rows.map((signature) => normalizePlacement(signature))

    if (user?.isAdmin) {
      return normalizeRows(adminSignatures.filter((signature) => signature.status !== "rejected"))
    }

    const withoutMine = approved.filter((signature) => signature.userId !== mine?.userId)
    return normalizeRows(mine ? [...withoutMine, mine] : withoutMine)
  }, [adminSignatures, approved, mine, normalizePlacement, user?.isAdmin])

  const pendingSignatures = adminSignatures.filter((signature) => signature.status === "pending")
  const statusLabel = mine
    ? mine.status === "approved"
      ? "Approved"
      : mine.status === "pending"
        ? "Pending"
        : "Rejected"
    : "Not signed"
  const statusClass = mine
    ? mine.status === "approved"
      ? "border-primary/20 bg-primary/10 text-primary"
      : mine.status === "pending"
        ? "border-accent/30 bg-accent/10 text-accent-foreground"
        : "border-destructive/25 bg-destructive/10 text-destructive"
    : "border-border bg-muted text-muted-foreground"

  const updateSignatureState = (signature: VoteSignature) => {
    setMine((current) => (current?.id === signature.id ? signature : current))
    setApproved((current) =>
      signature.status === "approved"
        ? [
            ...current.filter((item) => item.id !== signature.id),
            signature,
          ]
        : current.filter((item) => item.id !== signature.id)
    )
    setAdminSignatures((current) =>
      current.some((item) => item.id === signature.id)
        ? current.map((item) => (item.id === signature.id ? signature : item))
        : [...current, signature]
    )
  }

  const canMoveSignature = (signature: VoteSignature) => {
    return Boolean(user?.isAdmin || signature.id === mine?.id)
  }

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
      window.dispatchEvent(new Event("vote-signatures-changed"))
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

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>, signature: VoteSignature) => {
    if (!canMoveSignature(signature)) return
    const board = boardRef.current
    if (!board) return
    const rect = board.getBoundingClientRect()
    dragRef.current = {
      id: signature.id,
      offsetX: event.clientX - rect.left - signature.x * rect.width,
      offsetY: event.clientY - rect.top - signature.y * rect.height,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const dragSignature = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    const board = boardRef.current
    if (!board) return
    const signature = displayedSignatures.find((item) => item.id === dragRef.current?.id)
    if (!signature) return
    const rect = board.getBoundingClientRect()
    const x = (event.clientX - rect.left - dragRef.current.offsetX) / rect.width
    const y = (event.clientY - rect.top - dragRef.current.offsetY) / rect.height
    const next = normalizePlacement({
      ...signature,
      x,
      y,
    })
    const nextPlacement = { ...placementRef.current, x: next.x, y: next.y }
    placementRef.current = nextPlacement
    updateSignatureState(next)
    if (next.id === mine?.id) setDraftPlacement(nextPlacement)
  }

  const endDrag = async () => {
    if (!dragRef.current) return
    const signature = displayedSignatures.find((item) => item.id === dragRef.current?.id)
    dragRef.current = null
    if (signature) await savePlacement(signature)
  }

  const savePlacement = async (signature = mine) => {
    if (!signature) return
    setIsSaving(true)
    setError("")
    try {
      const updated = await updateSignaturePlacement(signature.id, {
        x: signature.id === mine?.id ? placementRef.current.x : signature.x,
        y: signature.id === mine?.id ? placementRef.current.y : signature.y,
        width: signature.id === mine?.id ? placementRef.current.width : signature.width,
        rotation: signature.id === mine?.id ? placementRef.current.rotation : signature.rotation,
        color: signature.id === mine?.id ? placementRef.current.color : signature.color,
        glowEnabled: signature.id === mine?.id ? placementRef.current.glowEnabled : signature.glowEnabled,
      })
      updateSignatureState(updated)
      setMessage(
        signature.id === mine?.id
          ? "Your signature position is saved."
          : `${signature.authorName}'s signature position is saved.`
      )
      await refresh()
      window.dispatchEvent(new Event("vote-signatures-changed"))
    } catch (err) {
      setError(
        err instanceof Error
          ? `Could not save the placement: ${err.message}`
          : "Could not save the placement."
      )
    } finally {
      setIsSaving(false)
    }
  }

  const updateDraft = (next: Partial<typeof draftPlacement>) => {
    const merged = normalizePlacement({ ...placementRef.current, ...next })
    if (next.glowEnabled && !referralState.glowUnlocked) {
      merged.glowEnabled = false
    }
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
      window.dispatchEvent(new Event("vote-signatures-changed"))
      setMessage(status === "approved" ? "Signature approved." : "Signature rejected.")
    } catch (err) {
      setError(
        err instanceof Error
          ? `Could not update that signature: ${err.message}`
          : "Could not update that signature. Please try again."
      )
    } finally {
      setIsSaving(false)
    }
  }

  const saveReferrals = async () => {
    setIsSaving(true)
    setError("")
    try {
      const state = await saveReferralList(referralEmails)
      setReferralState(state)
      setReferralEmails([
        ...state.emails,
        ...Array(Math.max(0, 5 - state.emails.length)).fill(""),
      ].slice(0, 5))
      const accepted = state.results.filter((result) => result.status === "accepted").length
      const invalid = state.results.filter((result) => result.status === "invalid").length
      setMessage(`Friend list saved. ${accepted} valid, ${invalid} invalid.`)
      if (!state.glowUnlocked && draftPlacement.glowEnabled) {
        updateDraft({ glowEnabled: false })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save friend list.")
    } finally {
      setIsSaving(false)
    }
  }

  const shareSignature = async () => {
    if (!user) return
    const url = `${window.location.origin}/#sign-vote`
    const text = `Vote Daniel Johnson for House Council President.\nAdd your signature and put my email (${user.email}) on your friend list:\n${url}`

    try {
      if (navigator.share) {
        await navigator.share({
          text,
        })
      } else {
        await navigator.clipboard.writeText(text)
        setMessage("Share message copied.")
      }
    } catch {
      await navigator.clipboard.writeText(text)
      setMessage("Share message copied.")
    }
  }

  return (
    <section id="sign-vote" className="bg-secondary/45 px-6 py-14">
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

        {!isPlacementOpen && (
          <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-lg border border-primary/25 bg-primary shadow-sm">
            <div
              className="relative aspect-[390/760] w-full overflow-hidden md:aspect-[1000/560]"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 20% 20%, oklch(0.55 0.12 145 / 0.35), transparent 55%), oklch(0.32 0.12 145)",
              }}
              aria-label="Current signature preview"
            >
              <div className="pointer-events-none absolute inset-0 z-0">
                {displayedSignatures.map((signature) => (
                  <div
                    key={signature.id}
                    className="absolute"
                    style={signaturePlacementStyle(signature, false)}
                    title={
                      signature.status === "pending"
                        ? `${signature.authorName} - pending approval`
                        : signature.authorName
                    }
                  >
                    {signature.glowEnabled && (
                      <div
                        className="absolute inset-0"
                        style={{ filter: "blur(6px) saturate(1.7)", opacity: 1 }}
                      >
                        <div className="h-full w-full" style={signatureGlowStyle(signature)} />
                      </div>
                    )}
                    <div className="absolute inset-0" style={signatureInkStyle(signature)} />
                  </div>
                ))}
              </div>
              <div className="absolute left-[18%] top-[8%] z-10 max-w-[64%] rounded-lg border border-primary-foreground/25 bg-primary-foreground/5 px-3 py-1.5 text-center text-[10px] font-medium tracking-wide text-primary-foreground/90 md:left-[6%] md:top-[15%] md:max-w-[39%] md:px-4 md:py-2 md:text-left md:text-xs">
                Running for <span className="text-accent">House Council President</span>
              </div>
              <div className="absolute left-[10%] top-[18%] z-10 max-w-[80%] text-center md:left-[6%] md:top-[30%] md:max-w-[50%] md:text-left">
                <div className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-primary-foreground md:text-5xl">
                  Vote <span className="text-accent">Daniel Johnson</span>
                </div>
                <p className="mx-auto mt-3 max-w-[92%] font-serif text-sm font-semibold leading-relaxed text-primary-foreground/95 md:mx-0 md:mt-4 md:text-lg">
                  {CAMPAIGN_SLOGAN}
                </p>
              </div>
              <div className="absolute left-[12%] top-[39%] z-10 flex max-w-[76%] flex-wrap justify-center gap-2 md:left-[6%] md:top-[62%] md:max-w-[56%] md:justify-start md:gap-3">
                <div className="rounded-lg bg-primary-foreground px-3 py-2 text-[10px] font-semibold text-primary shadow-sm md:px-5 md:py-2.5 md:text-xs">
                  See my platform
                </div>
                <div className="rounded-lg border border-primary-foreground/35 bg-primary-foreground/5 px-3 py-2 text-[10px] font-semibold text-primary-foreground md:px-5 md:py-2.5 md:text-xs">
                  Ask me a question
                </div>
                <div className="rounded-lg border border-accent/50 bg-accent/15 px-3 py-2 text-[10px] font-semibold text-primary-foreground md:px-5 md:py-2.5 md:text-xs">
                  Join the campaign
                </div>
              </div>
              <div className="absolute bottom-[9%] left-[28%] z-10 w-[48%] md:left-auto md:right-[7%] md:w-[25%]">
                <Image
                  src="/images/candidate.png"
                  alt="Daniel Johnson"
                  width={360}
                  height={450}
                  className="h-auto w-full object-contain"
                  priority={false}
                />
              </div>
              {isRefreshing && (
                <div className="absolute inset-0 z-20 grid place-items-center bg-background/50 text-sm text-muted-foreground">
                  Loading signatures...
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mx-auto mt-8 flex max-w-3xl flex-col items-start justify-between gap-4 rounded-lg border border-border bg-background p-5 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-semibold text-foreground">Your signature</h3>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Write your signature, place it, and check its status.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isLoading ? (
              <button
                type="button"
                disabled
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground"
              >
                Loading...
              </button>
            ) : !user ? (
              <button
                type="button"
                onClick={() => signInWithGoogle("/#sign-vote")}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Sign in to sign
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPlacementOpen(true)}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Open signature UI
              </button>
            )}
          </div>
        </div>

        {isPlacementOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-foreground/45 px-4 py-6">
            <div className="mx-auto w-full max-w-6xl rounded-lg border border-border bg-background p-4 shadow-lg md:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Signature</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Keep it off the text, buttons, and photo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPlacementOpen(false)}
                  className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Close signature UI"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="pb-2">
          <div
            ref={boardRef}
            className="relative mx-auto aspect-[390/760] w-full max-w-[430px] overflow-hidden rounded-lg border border-primary/30 bg-primary shadow-sm md:aspect-[1000/560] md:max-w-[1000px]"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 20% 20%, oklch(0.55 0.12 145 / 0.35), transparent 55%), oklch(0.32 0.12 145)",
            }}
            aria-label="Hero signature placement preview"
          >
            <div className="absolute left-[18%] top-[8%] max-w-[64%] rounded-lg border border-primary-foreground/25 bg-primary-foreground/5 px-3 py-1.5 text-center text-[10px] font-medium tracking-wide text-primary-foreground/90 md:left-[6%] md:top-[18%] md:max-w-[39%] md:px-4 md:py-2 md:text-left md:text-xs">
              Running for <span className="text-accent">House Council President</span>
            </div>
            <div className="absolute left-[10%] top-[18%] max-w-[80%] text-center md:left-[6%] md:top-[32%] md:max-w-[50%] md:text-left">
              <div className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-primary-foreground md:text-5xl">
                Vote <span className="text-accent">Daniel Johnson</span>
              </div>
              <p className="mx-auto mt-3 max-w-[92%] font-serif text-sm font-semibold leading-relaxed text-primary-foreground/95 md:mx-0 md:mt-4 md:text-lg">
                {CAMPAIGN_SLOGAN}
              </p>
            </div>
            <div className="absolute left-[12%] top-[39%] flex max-w-[76%] flex-wrap justify-center gap-2 md:left-[6%] md:top-[64%] md:max-w-[56%] md:justify-start md:gap-3">
              <div className="rounded-lg bg-primary-foreground px-3 py-2 text-[10px] font-semibold text-primary shadow-sm md:px-5 md:py-2.5 md:text-xs">
                See my platform
              </div>
              <div className="rounded-lg border border-primary-foreground/35 bg-primary-foreground/5 px-3 py-2 text-[10px] font-semibold text-primary-foreground md:px-5 md:py-2.5 md:text-xs">
                Ask me a question
              </div>
              <div className="rounded-lg border border-accent/50 bg-accent/15 px-3 py-2 text-[10px] font-semibold text-primary-foreground md:px-5 md:py-2.5 md:text-xs">
                Join the campaign
              </div>
            </div>
            <div className="absolute bottom-[9%] left-[28%] w-[48%] md:left-auto md:right-[7%] md:w-[29%]">
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
              const canDrag = canMoveSignature(signature)
              return (
                <div
                  key={signature.id}
                  className={`absolute touch-none transition-opacity ${
                    isMine || signature.status === "pending"
                      ? "outline outline-2 outline-offset-4 outline-primary-foreground/35"
                      : ""
                  }`}
                  style={signaturePlacementStyle(signature, canDrag)}
                  title={
                    signature.status === "pending"
                      ? `${signature.authorName} - pending approval`
                      : signature.authorName
                  }
                  onPointerDown={(event) => beginDrag(event, signature)}
                  onPointerMove={dragSignature}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                >
                  {signature.glowEnabled && (
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{ filter: "blur(6px) saturate(1.7)", opacity: 1 }}
                    >
                      <div className="h-full w-full" style={signatureGlowStyle(signature)} />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0" style={signatureInkStyle(signature)} />
                </div>
              )
            })}
            {isRefreshing && (
              <div className="absolute inset-0 grid place-items-center bg-background/55 text-sm text-muted-foreground">
                Loading signatures...
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto mt-7 max-w-3xl rounded-lg border border-border bg-background p-5">
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
                      : "Draw with your screen or mouse."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCaptureOpen(true)
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <PenLine className="h-4 w-4" />
                    Write your signature
                  </button>
                  <button
                    type="button"
                    onClick={shareSignature}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>
              <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                {user.isAdmin
                  ? "Admin signatures are approved automatically. Student signatures still need your approval before they appear for everyone."
                  : "Note: every new or replaced signature must be approved by an admin before it appears for everyone."}
              </p>
              <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Placement may look a little different on desktop and mobile. If the screen size
                would put a signature behind the text, buttons, or photo, it will automatically
                move to the nearest open spot.
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
                      <div className="mt-2 flex flex-wrap gap-3">
                        {SIGNATURE_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => updateDraft({ color })}
                            className={`h-10 w-10 rounded-lg border-2 shadow-sm md:h-12 md:w-12 ${
                              draftPlacement.color === color
                                ? "border-foreground ring-2 ring-ring/25"
                                : "border-border"
                            }`}
                            style={{ backgroundColor: color }}
                            aria-label={`Use ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <label className="flex items-center justify-between gap-3 text-sm font-medium text-foreground">
                      Glowing signature
                      <input
                        type="checkbox"
                        checked={draftPlacement.glowEnabled && referralState.glowUnlocked}
                        disabled={!referralState.glowUnlocked}
                        onChange={(event) => updateDraft({ glowEnabled: event.target.checked })}
                        className="h-5 w-5 rounded border-input text-primary focus:ring-primary"
                      />
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {referralState.credits}/5 friends have added you. Unlock a glowing signature
                      while 5 people keep you on their list.
                    </p>
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
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Glowing signature: {referralState.credits}/5
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add up to 5 friends by email. If 5 people add your email, a glowing signature unlocks.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={saveReferrals}
                    disabled={isSaving || !mine}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                  >
                    Save list
                  </button>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(referralState.credits, 5) * 20}%` }}
                  />
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {referralEmails.map((email, index) => (
                    <input
                      key={index}
                      type="email"
                      value={email}
                      onChange={(event) => {
                        const next = [...referralEmails]
                        next[index] = event.target.value
                        setReferralEmails(next)
                      }}
                      placeholder={`Friend ${index + 1} email`}
                      className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={shareSignature}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <Share2 className="h-4 w-4" />
                  Share invite
                </button>
                {referralState.results.length > 0 && (
                  <div className="mt-4 rounded-lg border border-border bg-background p-3">
                    <p className="text-sm font-semibold text-foreground">Last save results</p>
                    <div className="mt-2 space-y-1">
                      {referralState.results.map((result) => (
                        <p
                          key={`${result.email}-${result.reason ?? result.status}`}
                          className={
                            result.status === "accepted"
                              ? "text-sm text-primary"
                              : "text-sm text-destructive"
                          }
                        >
                          {result.email}:{" "}
                          {result.status === "accepted" ? "valid" : result.reason ?? "invalid"}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
          </div>
        )}
      </div>

      {isCaptureOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/45 px-4 py-6">
          <div className="w-full max-w-2xl rounded-lg border border-border bg-background p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Write your signature
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

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {SIGNATURE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-10 w-10 rounded-lg border-2 shadow-sm md:h-12 md:w-12 ${
                    selectedColor === color
                      ? "border-foreground ring-2 ring-ring/25"
                      : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Draw with ${color}`}
                />
              ))}
            </div>

            <canvas
              ref={canvasRef}
              className="mt-4 h-56 w-full touch-none rounded-lg border border-input bg-primary/10"
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

            {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}
          </div>
        </div>
      )}
    </section>
  )
}

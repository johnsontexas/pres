"use client"

import { useEffect, useState } from "react"
import type { CSSProperties } from "react"
import { useAuth } from "@/components/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { getSignatureZones, normalizeSignaturePlacement } from "@/lib/signature-layout"
import { getAllSignaturesForAdmin, getApprovedSignatures } from "@/lib/vote-signatures"
import type { VoteSignature } from "@/lib/vote-signatures"

function displaySignatureColor(color: string) {
  return color === "#111827" ? "#FFFFFF" : color
}

function signatureStyle(signature: VoteSignature): CSSProperties {
  const color = displaySignatureColor(signature.color)
  return {
    left: `${signature.x * 100}%`,
    top: `${signature.y * 100}%`,
    width: `${signature.width * 100}%`,
    aspectRatio: "3 / 1",
    backgroundColor: color,
    maskImage: `url(${signature.imageUrl})`,
    WebkitMaskImage: `url(${signature.imageUrl})`,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    opacity: signature.status === "approved" ? 0.82 : 0.42,
    transform: `translate(-50%, -50%) rotate(${signature.rotation}deg)`,
    filter: signature.glowEnabled
      ? `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 18px ${color}) drop-shadow(0 0 30px ${color})`
      : undefined,
  }
}

export function HeroSignatures() {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [signatures, setSignatures] = useState<VoteSignature[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadSignatures() {
      const rows = user?.isAdmin
        ? await getAllSignaturesForAdmin()
        : await getApprovedSignatures()

      if (!cancelled) {
        const zones = getSignatureZones(isMobile)
        setSignatures(
          rows
            .filter((signature) => signature.status !== "rejected")
            .map((signature) => normalizeSignaturePlacement(signature, zones))
        )
      }
    }

    const handleChange = () => {
      void loadSignatures()
    }

    void loadSignatures()
    window.addEventListener("vote-signatures-changed", handleChange)

    return () => {
      cancelled = true
      window.removeEventListener("vote-signatures-changed", handleChange)
    }
  }, [isMobile, user?.isAdmin])

  if (signatures.length === 0) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 mx-auto max-w-6xl overflow-hidden"
      aria-hidden
    >
      {signatures.map((signature) => (
        <div
          key={signature.id}
          className="absolute"
          style={signatureStyle(signature)}
        />
      ))}
    </div>
  )
}

export type SignaturePlacement = {
  x: number
  y: number
  width: number
}

export type SignatureZone = {
  x1: number
  y1: number
  x2: number
  y2: number
}

export const DESKTOP_SIGNATURE_ZONES: SignatureZone[] = [
  { x1: 0.06, y1: 0.18, x2: 0.45, y2: 0.29 },
  { x1: 0.06, y1: 0.31, x2: 0.57, y2: 0.59 },
  { x1: 0.06, y1: 0.63, x2: 0.62, y2: 0.77 },
  { x1: 0.62, y1: 0.14, x2: 0.96, y2: 0.9 },
]

export const MOBILE_SIGNATURE_ZONES: SignatureZone[] = [
  { x1: 0.18, y1: 0.08, x2: 0.82, y2: 0.15 },
  { x1: 0.1, y1: 0.18, x2: 0.9, y2: 0.36 },
  { x1: 0.12, y1: 0.39, x2: 0.88, y2: 0.5 },
  { x1: 0.28, y1: 0.56, x2: 0.76, y2: 0.91 },
]

export function getSignatureZones(isMobile: boolean) {
  return isMobile ? MOBILE_SIGNATURE_ZONES : DESKTOP_SIGNATURE_ZONES
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function signatureRect(placement: SignaturePlacement) {
  const height = placement.width / 3
  return {
    x1: placement.x - placement.width / 2,
    x2: placement.x + placement.width / 2,
    y1: placement.y - height / 2,
    y2: placement.y + height / 2,
  }
}

function overlaps(a: SignatureZone, b: SignatureZone) {
  return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1
}

export function normalizeSignaturePlacement<T extends SignaturePlacement>(
  placement: T,
  zones: SignatureZone[]
): T {
  const height = placement.width / 3
  let next = {
    ...placement,
    x: clamp(placement.x, placement.width / 2 + 0.02, 1 - placement.width / 2 - 0.02),
    y: clamp(placement.y, height / 2 + 0.03, 1 - height / 2 - 0.04),
  }

  for (const zone of zones) {
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
      zones.every((blockedZone) => !overlaps(signatureRect(candidate), blockedZone))
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

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
  { x1: 0.06, y1: 0.18, x2: 0.43, y2: 0.27 },
  { x1: 0.06, y1: 0.32, x2: 0.55, y2: 0.56 },
  { x1: 0.06, y1: 0.64, x2: 0.58, y2: 0.75 },
  { x1: 0.72, y1: 0.33, x2: 0.93, y2: 0.9 },
]

export const MOBILE_SIGNATURE_ZONES: SignatureZone[] = [
  { x1: 0.2, y1: 0.08, x2: 0.8, y2: 0.14 },
  { x1: 0.1, y1: 0.19, x2: 0.9, y2: 0.35 },
  { x1: 0.12, y1: 0.4, x2: 0.88, y2: 0.49 },
  { x1: 0.34, y1: 0.63, x2: 0.7, y2: 0.9 },
]

export function getSignatureZones(isMobile: boolean) {
  return isMobile ? MOBILE_SIGNATURE_ZONES : DESKTOP_SIGNATURE_ZONES
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function signatureRect(placement: SignaturePlacement, padding = 0.006) {
  const height = placement.width / 3
  return {
    x1: placement.x - placement.width / 2 - padding,
    x2: placement.x + placement.width / 2 + padding,
    y1: placement.y - height / 2 - padding,
    y2: placement.y + height / 2 + padding,
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
  const minX = placement.width / 2 + 0.012
  const maxX = 1 - placement.width / 2 - 0.012
  const minY = height / 2 + 0.018
  const maxY = 1 - height / 2 - 0.024
  let next = {
    ...placement,
    x: clamp(placement.x, minX, maxX),
    y: clamp(placement.y, minY, maxY),
  }

  const isValid = (candidate: SignaturePlacement) =>
    zones.every((blockedZone) => !overlaps(signatureRect(candidate), blockedZone))

  const nearestOpenPlacement = () => {
    const candidates: SignaturePlacement[] = []
    for (let y = minY; y <= maxY; y += 0.025) {
      for (let x = minX; x <= maxX; x += 0.025) {
        candidates.push({ ...next, x, y })
      }
    }

    return candidates
      .filter(isValid)
      .reduce<SignaturePlacement | null>((closest, candidate) => {
        if (!closest) return candidate
        const closestDistance = Math.hypot(closest.x - placement.x, closest.y - placement.y)
        const candidateDistance = Math.hypot(candidate.x - placement.x, candidate.y - placement.y)
        return candidateDistance < closestDistance ? candidate : closest
      }, null)
  }

  for (const zone of zones) {
    const rect = signatureRect(next)
    if (!overlaps(rect, zone)) continue

    const candidates = [
      { ...next, x: zone.x1 - next.width / 2 - 0.012 },
      { ...next, x: zone.x2 + next.width / 2 + 0.012 },
      { ...next, y: zone.y1 - height / 2 - 0.012 },
      { ...next, y: zone.y2 + height / 2 + 0.012 },
    ].map((candidate) => ({
      ...candidate,
      x: clamp(candidate.x, minX, maxX),
      y: clamp(candidate.y, minY, maxY),
    }))

    const validCandidates = candidates.filter(isValid)

    const fallback = nearestOpenPlacement()
    const choices = validCandidates.length > 0 ? validCandidates : fallback ? [fallback] : candidates
    next = choices.reduce((closest, candidate) => {
      const closestDistance = Math.hypot(closest.x - placement.x, closest.y - placement.y)
      const candidateDistance = Math.hypot(candidate.x - placement.x, candidate.y - placement.y)
      return candidateDistance < closestDistance ? candidate : closest
    }, choices[0])
  }

  return next
}

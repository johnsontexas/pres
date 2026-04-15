"use client"

import { Share2 } from "lucide-react"

export function ShareCampaignButton() {
  const shareCampaign = async () => {
    const url = "https://pickdaniel.com"
    const text = `Vote Daniel Johnson for House Council President\n${url}`

    try {
      if (navigator.share) {
        await navigator.share({
          text,
        })
        return
      }

      await navigator.clipboard.writeText(text)
    } catch {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <button
      type="button"
      onClick={shareCampaign}
      className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/35 bg-primary-foreground/5 px-7 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
    >
      <Share2 className="h-4 w-4" />
      Share
    </button>
  )
}

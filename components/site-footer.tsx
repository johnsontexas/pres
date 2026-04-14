import { CAMPAIGN_SLOGAN } from "@/lib/campaign"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary py-8">
      <div className="mx-auto max-w-6xl px-6 text-center lg:px-8">
        <p className="font-serif text-lg font-bold text-foreground">
          Vote Daniel Johnson
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{CAMPAIGN_SLOGAN}</p>
        <p className="font-hand mt-3 text-lg text-primary/90">Thanks for reading.</p>
        <p className="mt-4 text-xs text-muted-foreground/60">
          Ad Majorem Dei Gloriam
        </p>
        <p className="mt-3 text-xs">
          <a
            href="https://www.instagram.com/danieljohnsontx"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground/80 underline underline-offset-2 hover:text-foreground"
          >
            Follow along on Instagram @danieljohnsontx
          </a>
        </p>
      </div>
    </footer>
  )
}

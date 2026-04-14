import Link from "next/link"
import { Mail, Instagram, Cross } from "lucide-react"
import { CAMPAIGN_SLOGAN } from "@/lib/campaign"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-secondary py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <h3 className="font-serif text-xl font-bold text-foreground">Vote Daniel Johnson</h3>
            <p className="mt-2 text-sm text-muted-foreground">{CAMPAIGN_SLOGAN}</p>
            <p className="mt-3 text-sm font-medium text-muted-foreground">Thanks for reading.</p>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Cross className="h-3.5 w-3.5 text-accent" />
              Ad Majorem Dei Gloriam
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">Navigation</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/#platform" className="text-muted-foreground transition-colors hover:text-foreground">
                  Platform
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-muted-foreground transition-colors hover:text-foreground">
                  News
                </Link>
              </li>
              <li>
                <Link href="/questions" className="text-muted-foreground transition-colors hover:text-foreground">
                  Q&amp;A
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">Connect</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="mailto:dajohnson27@mail.strakejesuit.org"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  School email
                </a>
              </li>
              <li>
                <a
                  href="mailto:daniel@johnsontexas.com"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  Personal email
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/danieljohnsontx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Instagram className="h-4 w-4" />
                  @danieljohnsontx
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/50 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Vote Daniel Johnson for House Council President · Election week begins April 27, 2026
          </p>
        </div>
      </div>
    </footer>
  )
}

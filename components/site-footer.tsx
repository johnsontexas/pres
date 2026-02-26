import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <p className="font-serif text-lg font-bold text-foreground">
              Vote Daniel Johnson
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              House Council President — Strake Jesuit College Preparatory
            </p>
          </div>
          <nav className="flex items-center gap-6" aria-label="Footer navigation">
            <Link href="/#about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">About</Link>
            <Link href="/#platform" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Platform</Link>
            <Link href="/news" className="text-sm text-muted-foreground transition-colors hover:text-foreground">News</Link>
            <Link href="/questions" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Q&A</Link>
          </nav>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-xs tracking-wider text-muted-foreground/50 uppercase">
            Ad Majorem Dei Gloriam
          </p>
        </div>
      </div>
    </footer>
  )
}

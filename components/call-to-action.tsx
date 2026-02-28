import Link from "next/link"
import { Vote, Instagram } from "lucide-react"

export function CallToAction() {
  return (
    <section className="bg-secondary py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
        <div className="fade-in">
          <h2 className="font-serif text-5xl font-bold text-foreground md:text-6xl">
            Make Your Voice Heard
          </h2>
          <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-gradient-to-r from-primary to-accent" />
          <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground">
            Election Day is coming in May 2026. When the time comes, make your voice count and vote Daniel Johnson for House Council President.
          </p>
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="flex items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/10 px-8 py-4 text-base font-bold text-primary">
              <Vote className="h-5 w-5" />
              May 2026
            </div>
            <a
              href="https://www.instagram.com/txdanieljohnson"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border-2 border-border bg-background px-8 py-4 text-base font-semibold text-foreground transition-all hover:border-primary hover:bg-secondary"
            >
              <Instagram className="h-5 w-5" />
              Follow @txdanieljohnson
            </a>
          </div>
          <div className="mt-10">
            <Link
              href="/questions"
              className="text-base font-medium text-primary hover:underline"
            >
              Have questions? Ask me anything →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

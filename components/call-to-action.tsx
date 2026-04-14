import Link from "next/link"

export function CallToAction() {
  return (
    <section id="contact" className="border-t border-primary/10 bg-background py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
          Make your voice heard
        </h2>
        <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-primary/40 via-accent to-primary/40" />
        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Election week starts April 27, 2026. When the time comes, I&apos;d be honored if you&apos;d vote for me for House Council President.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <span className="inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md ring-1 ring-primary/20">
            April 2026 · election week
          </span>
          <a
            href="https://www.instagram.com/danieljohnsontx"
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-2xl border-2 border-primary/25 bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-secondary"
          >
            @danieljohnsontx on Instagram
          </a>
        </div>
        <div className="mt-10">
          <Link href="/questions" className="text-base font-medium text-primary hover:underline">
            Have questions? Ask me anything →
          </Link>
        </div>
      </div>
    </section>
  )
}

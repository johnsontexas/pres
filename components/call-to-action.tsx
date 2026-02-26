import Link from "next/link"

export function CallToAction() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <p className="text-sm font-semibold tracking-widest text-accent uppercase">Make a difference</p>
        <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl text-balance">
          Make Your Voice Heard
        </h2>
        <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-accent" />
        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Election Day is coming in May 2026. When the time comes, make your voice count and vote Daniel Johnson for House Council President.
        </p>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/questions"
            className="rounded-lg bg-accent px-10 py-4 text-sm font-bold text-accent-foreground shadow-lg shadow-accent/25 transition-all hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
          >
            Ask a Question
          </Link>
          <Link
            href="/news"
            className="rounded-lg border border-border px-10 py-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Read the News
          </Link>
        </div>
      </div>
    </section>
  )
}

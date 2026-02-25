export function CallToAction() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
          Make Your Voice Heard
        </h2>
        <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-accent" />
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Election Day is coming in May 2026. When the time comes, make your voice count and vote Daniel Johnson for House Council President.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#"
            className="rounded-lg bg-primary px-10 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            May 2026
          </a>
          <a
            href="#"
            className="rounded-lg border border-border px-10 py-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Follow @DanielJohnson
          </a>
        </div>
      </div>
    </section>
  )
}

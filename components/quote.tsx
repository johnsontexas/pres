export function Quote() {
  return (
    <section className="relative overflow-hidden bg-primary py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 100%, oklch(0.35 0.1 145 / 0.5), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
        <p className="font-hand text-4xl leading-none text-primary-foreground/50 md:text-5xl" aria-hidden>
          “
        </p>
        <blockquote>
          <p className="font-serif text-2xl font-medium italic leading-relaxed text-primary-foreground md:text-3xl text-balance">
            I&apos;m not just running for a title — I&apos;m running to make sure every student at Strake Jesuit has a seat at the table.
          </p>
        </blockquote>
        <p className="mt-8 border-t border-primary-foreground/20 pt-6 font-sans text-sm font-medium text-primary-foreground/80">
          — Daniel Johnson
        </p>
        <p className="mt-1 text-xs text-primary-foreground/55">House Council President candidate</p>
      </div>
    </section>
  )
}

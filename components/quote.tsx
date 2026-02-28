export function Quote() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent py-24 md:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <div className="fade-in">
          <blockquote>
            <p className="font-serif text-3xl font-semibold leading-snug text-primary-foreground md:text-4xl lg:text-5xl">
              I'm not just running for a title — I'm running to make sure every student at Strake Jesuit has a seat at the table.
            </p>
          </blockquote>
          <p className="mt-10 text-base font-medium text-primary-foreground/80">
            Daniel Johnson
            <br />
            <span className="text-sm text-primary-foreground/60">
              Candidate for House Council President
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}

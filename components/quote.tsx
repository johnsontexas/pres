export function Quote() {
  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <blockquote>
          <p className="font-serif text-2xl font-medium leading-relaxed text-primary-foreground md:text-3xl text-balance">
            {'"I\'m not just running for a title — I\'m running to make sure every student at Strake Jesuit has a seat at the table."'}
          </p>
        </blockquote>
        <p className="mt-6 text-sm font-medium tracking-wide text-primary-foreground/70 uppercase">
          — Daniel Johnson, Candidate for House Council President
        </p>
      </div>
    </section>
  )
}

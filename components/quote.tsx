export function Quote() {
  return (
    <section className="relative overflow-hidden bg-primary py-20 md:py-28">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")' }} />
      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <div className="mx-auto mb-8 h-1 w-16 rounded-full bg-accent" />
        <blockquote>
          <p className="font-serif text-2xl font-medium leading-relaxed text-primary-foreground md:text-3xl lg:text-4xl text-balance">
            {'"I\'m not just running for a title \u2014 I\'m running to make sure every student at Strake Jesuit has a seat at the table."'}
          </p>
        </blockquote>
        <p className="mt-8 text-sm font-semibold tracking-widest text-primary-foreground/60 uppercase">
          Daniel Johnson
        </p>
      </div>
    </section>
  )
}

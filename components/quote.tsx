import { CAMPAIGN_SLOGAN } from "@/lib/campaign"

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
        <blockquote>
          <p className="font-serif text-lg font-semibold leading-relaxed text-primary-foreground md:text-xl lg:text-2xl text-balance">
            {CAMPAIGN_SLOGAN}
          </p>
        </blockquote>
        <p className="mt-8 border-t border-primary-foreground/20 pt-6 text-sm font-medium text-primary-foreground/85">
          Daniel Johnson
        </p>
        <p className="mt-1 text-xs text-primary-foreground/60">House Council President candidate</p>
      </div>
    </section>
  )
}

import Image from "next/image"
import Link from "next/link"
import { Cross } from "lucide-react"
import { HeroSignatures } from "@/components/hero-signatures"
import { CAMPAIGN_SLOGAN } from "@/lib/campaign"

const JOIN_CAMPAIGN_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe6uhueV-xclcAqBUoOqE5WVggvSNK3NEi2qUHVlvrZev7KBQ/viewform"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 20%, oklch(0.55 0.12 145 / 0.35), transparent 55%)",
        }}
      />
      <HeroSignatures />

      <div className="relative z-20 mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-20 md:flex-row md:items-center md:gap-12 md:py-28 lg:px-8">
        <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
          <span className="mb-3 inline-block max-w-md rounded-lg border border-primary-foreground/25 bg-primary-foreground/5 px-4 py-2 text-xs font-medium tracking-wide text-primary-foreground/90 md:text-sm">
            Running for <span className="text-accent">House Council President</span>
          </span>
          <h1 className="font-display text-5xl font-bold leading-[1.08] tracking-tight text-primary-foreground md:text-6xl lg:text-7xl text-balance">
            Vote{" "}
            <span className="text-accent">Daniel Johnson</span>
          </h1>
          <p className="mt-5 max-w-2xl text-balance font-serif text-base font-semibold leading-relaxed text-primary-foreground/95 sm:text-lg md:text-xl">
            {CAMPAIGN_SLOGAN}
          </p>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/75">
            Glad you&apos;re here, if something&apos;s on your mind, the Q&amp;A page is the best place to reach me.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <a
              href="#platform"
              className="rounded-lg bg-primary-foreground px-7 py-3 text-sm font-semibold text-primary shadow-sm transition hover:opacity-95"
            >
              See my platform
            </a>
            <Link
              href="/questions"
              className="rounded-lg border border-primary-foreground/35 bg-primary-foreground/5 px-7 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
            >
              Ask me a question
            </Link>
            <a
              href={JOIN_CAMPAIGN_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/15 px-7 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent/25"
            >
              <Cross className="h-4 w-4" />
              Join the campaign
            </a>
          </div>
        </div>

        <div className="flex w-full max-w-md flex-1 justify-center md:justify-end">
          <div className="flex w-full items-center justify-center bg-transparent">
            <Image
              src="/images/candidate.png"
              alt="Daniel Johnson"
              width={400}
              height={500}
              className="h-auto w-full max-w-[320px] object-contain md:max-w-[360px]"
              priority
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-30">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 33.3C672 36.7 768 43.3 864 45C960 46.7 1056 43.3 1152 40C1248 36.7 1344 33.3 1392 31.7L1440 30V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  )
}

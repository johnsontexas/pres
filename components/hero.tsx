import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-20 md:flex-row md:py-28 lg:px-8">
        {/* Text Content */}
        <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
          <span className="mb-4 inline-block rounded-full border border-primary-foreground/20 px-4 py-1.5 text-sm font-medium tracking-wide text-primary-foreground/80 uppercase">
            House Council President
          </span>
          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-primary-foreground md:text-6xl lg:text-7xl text-balance">
            Vote{" "}
            <span className="text-accent">Daniel Johnson</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-primary-foreground/80">
            Leadership that listens. A voice for every Crusader.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#platform"
              className="rounded-lg bg-primary-foreground px-8 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
            >
              See My Platform
            </a>
            <Link
              href="/questions"
              className="rounded-lg border border-primary-foreground/30 px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Ask Me a Question
            </Link>
          </div>
        </div>

        {/* Candidate Photo */}
        <div className="flex flex-1 justify-center md:justify-end">
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl bg-accent/30" />
            <Image
              src="/images/candidate.jpg"
              alt="Candidate portrait photo"
              width={360}
              height={440}
              className="relative rounded-2xl object-cover shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
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

import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-24 md:flex-row md:py-32 lg:px-8">
        {/* Text Content */}
        <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 px-5 py-2 text-sm font-medium tracking-wide text-primary-foreground/90">
            <span className="h-2 w-2 rounded-full bg-accent" />
            House Council President
          </span>
          <h1 className="font-serif text-5xl font-bold leading-[1.1] tracking-tight text-primary-foreground md:text-6xl lg:text-7xl text-balance">
            Vote{" "}
            <span className="text-accent">Daniel<br className="hidden md:block" /> Johnson</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-primary-foreground/75">
            Leadership that listens. A voice for every Crusader.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#platform"
              className="rounded-lg bg-accent px-8 py-3.5 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition-all hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
            >
              See My Platform
            </a>
            <Link
              href="/questions"
              className="rounded-lg border border-primary-foreground/25 bg-primary-foreground/5 px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Ask Me a Question
            </Link>
          </div>
        </div>

        {/* Candidate Photo */}
        <div className="flex flex-1 justify-center md:justify-end">
          <div className="relative">
            <div className="absolute -inset-3 rounded-2xl bg-accent/20 blur-sm" />
            <div className="absolute -inset-1 rounded-2xl bg-accent/10" />
            <Image
              src="/images/candidate.jpg"
              alt="Candidate portrait photo"
              width={380}
              height={460}
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

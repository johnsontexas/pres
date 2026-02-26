import Image from "next/image"

export function About() {
  return (
    <section id="about" className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-16 md:flex-row">
          {/* School Logo */}
          <div className="flex flex-1 justify-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-secondary" />
              <Image
                src="/images/strake-jesuit.jpg"
                alt="Strake Jesuit College Preparatory logo"
                width={340}
                height={200}
                className="relative rounded-2xl object-contain"
              />
            </div>
          </div>

          {/* About Text */}
          <div className="flex-1">
            <p className="text-sm font-semibold tracking-widest text-accent uppercase">Get to know</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
              About Me
            </h2>
            <div className="mt-4 h-1 w-12 rounded-full bg-accent" />
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
              I{"'"}m Daniel Johnson, and I{"'"}m running for House Council President because I believe every Crusader deserves a leader who genuinely listens. I{"'"}m committed to making Strake Jesuit an even better place for all of us.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Through my involvement in clubs, athletics, and community service, I{"'"}ve seen firsthand what our student body cares about. I{"'"}m ready to bring those voices to the table and turn ideas into action.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

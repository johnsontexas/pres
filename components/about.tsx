import Image from "next/image"

export function About() {
  return (
    <section id="about" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-16">
          {/* School Logo */}
          <div className="flex flex-1 justify-center">
            <Image
              src="/images/strake-jesuit.jpg"
              alt="Strake Jesuit College Preparatory logo"
              width={340}
              height={200}
              className="object-contain"
            />
          </div>

          {/* About Text */}
          <div className="flex-1">
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
              About Me
            </h2>
            <div className="mt-2 h-1 w-16 rounded-full bg-accent" />
            <p className="mt-6 leading-relaxed text-muted-foreground">
              I'm Daniel Johnson, and I'm running for House Council President because I believe every Crusader deserves a leader who genuinely listens. I'm committed to making Strake Jesuit an even better place for all of us.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Through my involvement in clubs, athletics, and community service, I've seen firsthand what our student body cares about. I'm ready to bring those voices to the table and turn ideas into action.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

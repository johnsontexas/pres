import Image from "next/image"

export function About() {
  return (
    <section id="about" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-14 md:flex-row md:items-start md:gap-16">
          <div className="flex flex-1 justify-center md:sticky md:top-28">
            <div className="relative rotate-[-1deg] rounded-2xl border border-border bg-card p-6 shadow-sm ring-1 ring-primary/10">
              <Image
                src="/images/strake-jesuit.jpg"
                alt="Strake Jesuit College Preparatory logo"
                width={300}
                height={180}
                className="object-contain"
              />
              <p className="mt-4 text-center text-sm font-semibold tracking-wide text-primary">
                Proud to be a Crusader
              </p>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
              My Story
            </h2>
            <div className="mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-accent to-primary" />
            <div className="mt-8 space-y-5 border-l-2 border-primary/25 pl-6">
              <p className="leading-relaxed text-muted-foreground">
                Hi, I&apos;m Daniel Johnson, a junior running for House Council President. I want to run to increase participation in our community through the house system. I want to lead with faith in Christ and through openness to the suggestions of fellow students.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Strake is an amazing school with so many opportunities to be men for others and during my time at Strake, I have been involved in several activities and groups that have taught me the importance of strong leadership and its impact on the community and I&apos;m honored to run for this position.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                What sets me apart is my commitment to making every voice heard. I want to be as transparent as possible and want to be a strong representative for every student at Strake. Please feel free to reach out to me through email, social media, or in person, I would love to talk.
              </p>
            </div>

            <h3 className="mt-12 font-serif text-2xl font-bold text-foreground md:text-3xl">
              Why I&apos;m Running
            </h3>
            <div className="mt-2 h-1 w-14 rounded-full bg-accent/80" />
            <p className="mt-6 leading-relaxed text-muted-foreground">
              The Strake Jesuit house system is an amazing, core part of our school, but I believe there are even more ways to build connections, grow in faith, and make events more engaging and enjoyable for everyone.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              As President, I want to be fully involved and ensure that every student feels included and has a great experience at house related events.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

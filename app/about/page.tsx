import Image from "next/image"
import Link from "next/link"
import { Mail, Cross } from "lucide-react"

export const metadata = {
  title: "About Daniel Johnson — House Council President Candidate",
  description: "Learn more about Daniel Johnson and his journey at Strake Jesuit College Preparatory.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <article className="mx-auto max-w-4xl px-6 py-12 lg:py-20">
        <div className="fade-in">
          <h1 className="font-serif text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
            More About Me
          </h1>
          <div className="mt-2 h-1 w-20 rounded-full bg-accent" />
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8 fade-in">
            <section>
              <h2 className="mb-4 font-serif text-2xl font-bold text-foreground">My Story</h2>
              <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
                <p>
                  Hi, I&apos;m Daniel Johnson, a junior running for House Council President. I want to run to increase participation in our community through the house system. I want to lead with faith in Christ and through openness to the suggestions of fellow students.
                </p>
                <p>
                  Strake is an amazing school with so many opportunities to be men for others and during my time at Strake, I have been involved in several activities and groups that have taught me the importance of strong leadership and its impact on the community and I&apos;m honored to run for this position.
                </p>
                <p>
                  What sets me apart is my commitment to making every voice heard. I want to be as transparent as possible and want to be a strong representative for every student at Strake. Please feel free to reach out to me through email, social media, or in person, I would love to talk.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-serif text-2xl font-bold text-foreground">Why I&apos;m Running</h2>
              <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
                <p>
                  The Strake Jesuit house system is an amazing, core part of our school, but I believe there are even more ways to build connections, grow in faith, and make events more engaging and enjoyable for everyone.
                </p>
                <p>
                  As President, I want to be fully involved and ensure that every student feels included and has a great experience at house related events.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-foreground">My Values</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Cross className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">Faith First</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Keeping God at the center of everything we do, supporting our spiritual community and traditions.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">Open Communication</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Always accessible, always listening, and always transparent in my decisions and actions.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-foreground">Let's Connect</h2>
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                Have questions? Want to share ideas? I'd love to hear from you. Together, we can make Strake Jesuit an even better place for all Crusaders.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/questions"
                  className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Ask Me a Question
                </Link>
                <Link
                  href="/#contact"
                  className="rounded-full border border-border bg-background px-6 py-3 font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  Contact Me
                </Link>
              </div>
            </section>
          </div>

          <aside className="fade-in lg:sticky lg:top-24 lg:h-fit">
            <div className="overflow-hidden rounded-2xl bg-transparent">
              <Image
                src="/images/candidate.png"
                alt="Daniel Johnson"
                width={400}
                height={500}
                className="h-auto w-full object-contain"
              />
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-3 font-semibold text-foreground">Quick Facts</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Current Student at Strake Jesuit</li>
                <li>Active in School Clubs & Athletics</li>
                <li>Committed to Community Service</li>
                <li>Running for House Council President</li>
              </ul>
            </div>
          </aside>
        </div>
      </article>
    </div>
  )
}

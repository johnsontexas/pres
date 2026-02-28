import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Mail, Cross } from "lucide-react"

export const metadata = {
  title: "About Daniel Johnson — House Council President Candidate",
  description: "Learn more about Daniel Johnson and his journey at Strake Jesuit College Preparatory.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
        <div className="fade-in">
          <h1 className="font-serif text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
            More About Me
          </h1>
          <div className="mt-2 h-1 w-20 rounded-full bg-accent" />
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8 fade-in">
            <section>
              <h2 className="mb-4 text-2xl font-bold text-foreground">My Story</h2>
              <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
                <p>
                  I'm Daniel Johnson, a student at Strake Jesuit College Preparatory, and I'm running for House Council President because I believe in the power of student voice and community engagement.
                </p>
                <p>
                  Throughout my time at Strake, I've been involved in various clubs, athletics, and community service activities. These experiences have taught me the importance of leadership, collaboration, and making sure every voice is heard.
                </p>
                <p>
                  What sets me apart is my commitment to listening. I don't just want to lead — I want to serve. I want to be the bridge between the student body and the administration, ensuring that your ideas, concerns, and dreams for our school are not just heard, but acted upon.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-foreground">Why I'm Running</h2>
              <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
                <p>
                  Our school has incredible potential, and I see opportunities everywhere to make the Strake Jesuit experience even better. From energizing Game Days to creating more opportunities for student involvement, from strengthening our faith community to ensuring every student feels represented — these aren't just campaign promises, they're commitments.
                </p>
                <p>
                  I'm running because I believe in us. I believe in what we can accomplish together when we work as one community with shared values and goals.
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
            <div className="overflow-hidden rounded-3xl bg-white">
              <Image
                src="/images/candidate.jpg"
                alt="Daniel Johnson"
                width={400}
                height={500}
                className="h-auto w-full object-cover"
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

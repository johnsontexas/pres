import { Mail } from "lucide-react"

export function Contact() {
  return (
    <section id="contact" className="bg-secondary py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <div className="fade-in">
          <h2 className="font-serif text-4xl font-bold text-foreground md:text-5xl">
            Get in Touch
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-accent" />
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Have questions, ideas, or want to discuss my campaign? I'd love to hear from you.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <a
            href="mailto:dajohnson27@mail.strakejesuit.org"
            className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Mail className="h-7 w-7 text-primary transition-colors group-hover:text-primary-foreground" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-foreground">School Email</h3>
              <p className="text-sm text-primary hover:underline">
                dajohnson27@mail.strakejesuit.org
              </p>
            </div>
          </a>

          <a
            href="mailto:daniel@johnsontexas.com"
            className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Mail className="h-7 w-7 text-primary transition-colors group-hover:text-primary-foreground" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-foreground">Personal Email</h3>
              <p className="text-sm text-primary hover:underline">
                daniel@johnsontexas.com
              </p>
            </div>
          </a>
        </div>

        <div className="mt-12">
          <p className="text-sm text-muted-foreground">
            You can also reach out through the{" "}
            <a href="/questions" className="font-medium text-primary hover:underline">
              Q&A section
            </a>{" "}
            on this website.
          </p>
        </div>
      </div>
    </section>
  )
}

import { Megaphone, Users, Calendar, Star } from "lucide-react"

const planks = [
  {
    icon: Megaphone,
    title: "Make Game Days More Fun",
    description:
      "I want to make Game Days more fun and enjoyable for everyone, with better energy, activities, and traditions that bring the whole school together.",
  },
  {
    icon: Users,
    title: "Be a Voice for Students",
    description:
      "I will be a voice for the students and always be open to ideas and advice, listening to what you want and bringing your feedback to House Council.",
  },
  {
    icon: Calendar,
    title: "More Activities and Competitions",
    description:
      "I want to add more activities and competitions throughout the year, like using intramural club competitions for house points, so there are more chances to get involved and have fun.",
  },
  {
    icon: Star,
    title: "Keeping God #1",
    description:
      "Most importantly, I want to help make sure God remains #1 in everything we do by supporting the traditions, retreats, and faith life that make our school special.",
  },
]

export function Platform() {
  return (
    <section id="platform" className="relative bg-secondary py-20 md:py-28">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
            My Platform
          </h2>
          <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Quick facts
          </p>
          <p className="mx-auto mt-3 max-w-2xl font-serif text-lg italic text-foreground/90 md:text-xl">
            Running for House Council President, committed to making every voice heard, wants to lead by faith and teamwork.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {planks.map((plank, i) => (
            <div
              key={plank.title}
              className={`group relative rounded-2xl border border-border/80 bg-card p-7 shadow-sm transition hover:shadow-md md:p-8 ${
                i % 2 === 1 ? "md:translate-y-3" : "md:-rotate-[0.3deg]"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-inner ring-1 ring-primary/15 transition group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary/30">
                <plank.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-serif text-lg font-semibold text-card-foreground">
                {plank.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{plank.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

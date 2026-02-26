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
    <section id="platform" className="bg-secondary py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
            My Platform
          </h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-accent" />
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            My goal is to make school more fun, more connected, and more faith-filled by bringing energy to Game Days, listening to students, adding competitions and activities, and always keeping God at the center.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {planks.map((plank) => (
            <div
              key={plank.title}
              className="group rounded-xl border border-border bg-card p-8 transition-shadow hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <plank.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-card-foreground">
                {plank.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {plank.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

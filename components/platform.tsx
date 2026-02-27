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
    <section id="platform" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="fade-in text-center">
          <h2 className="font-serif text-5xl font-bold text-foreground md:text-6xl">
            My Platform
          </h2>
          <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-gradient-to-r from-primary to-accent" />
          <p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-muted-foreground">
            My goal is to make school more fun, more connected, and more faith-filled by bringing energy to Game Days, listening to students, adding competitions and activities, and always keeping God at the center.
          </p>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:gap-10">
          {planks.map((plank, index) => (
            <div
              key={plank.title}
              className="group fade-in relative overflow-hidden rounded-3xl border border-border bg-card p-10 transition-all hover:shadow-2xl hover:shadow-primary/10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl" />
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary transition-all group-hover:scale-110 group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground">
                  <plank.icon className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-foreground">
                  {plank.title}
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {plank.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

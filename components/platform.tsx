import { Megaphone, Users, Calendar, Star } from "lucide-react"

const planks = [
  {
    icon: Megaphone,
    title: "[Platform Point 1]",
    description:
      "[Describe your first campaign promise or initiative. Be specific about what you will do and how it will benefit students.]",
  },
  {
    icon: Users,
    title: "[Platform Point 2]",
    description:
      "[Describe your second campaign promise. Focus on community, inclusivity, or school spirit.]",
  },
  {
    icon: Calendar,
    title: "[Platform Point 3]",
    description:
      "[Describe your third campaign promise. Think about events, activities, or improvements you want to bring.]",
  },
  {
    icon: Star,
    title: "[Platform Point 4]",
    description:
      "[Describe your fourth campaign promise. What sets you apart from other candidates?]",
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
            [A brief sentence about your overall vision for the House Council. What do you want to achieve?]
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

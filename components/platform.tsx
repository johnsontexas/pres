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
    <section id="platform" className="bg-secondary py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-widest text-accent uppercase">What I stand for</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
            My Platform
          </h2>
          <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-accent" />
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            [A brief sentence about your overall vision for the House Council. What do you want to achieve?]
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {planks.map((plank, i) => (
            <div
              key={plank.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-accent/5 transition-transform group-hover:translate-x-4 group-hover:-translate-y-4" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <plank.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-bold text-card-foreground">
                  {plank.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
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

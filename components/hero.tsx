"use client"

import Image from "next/image"
import Link from "next/link"
import { Cross } from "lucide-react"

const JOIN_CAMPAIGN_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe6uhueV-xclcAqBUoOqE5WVggvSNK3NEi2qUHVlvrZev7KBQ/viewform"

export function Hero() {

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/30 pt-24 pb-32 md:pt-32 md:pb-40">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              <Cross className="h-4 w-4" />
              House Council President
            </div>
            <h1 className="font-serif text-6xl font-bold leading-tight tracking-tight text-foreground md:text-7xl lg:text-8xl">
              Vote
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Daniel Johnson
              </span>
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-muted-foreground md:text-2xl">
              Leadership that listens. A voice for every Crusader.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#platform"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:scale-105 hover:shadow-lg"
              >
                See My Platform
              </a>
              <Link
                href="/questions"
                className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-background px-8 py-4 text-base font-semibold text-foreground transition-all hover:border-primary hover:bg-secondary"
              >
                Ask a Question
              </Link>
              <a
                href={JOIN_CAMPAIGN_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-accent/50 bg-accent/10 px-8 py-4 text-base font-semibold text-accent transition-all hover:border-accent hover:bg-accent/20"
              >
                <Cross className="h-5 w-5" />
                Join the Campaign
              </a>
            </div>
          </div>

          <div className="fade-in relative lg:pl-8">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-2xl bg-white">
                <Image
                  src="/images/candidate.jpg"
                  alt="Daniel Johnson"
                  width={600}
                  height={700}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

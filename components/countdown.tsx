"use client"

import { useEffect, useState } from "react"

const ELECTION_DATE = new Date("2026-05-01T08:00:00")

function getTimeLeft() {
  const now = new Date()
  const diff = ELECTION_DATE.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  }
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="flex h-18 w-18 items-center justify-center rounded-xl bg-primary text-3xl font-bold text-primary-foreground tabular-nums shadow-lg md:h-22 md:w-22 md:text-4xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  )
}

export function Countdown() {
  const [time, setTime] = useState(getTimeLeft)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeLeft())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (time.expired) {
    return (
      <section className="bg-background px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl font-bold text-accent md:text-4xl">
            Election Day Is Here!
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Go vote today. Make your voice heard.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-background px-6 py-20 text-center">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold tracking-widest text-accent uppercase">
          May 1, 2026
        </p>
        <h2 className="mt-3 font-serif text-2xl font-bold text-foreground md:text-3xl text-balance">
          Countdown to Election Day
        </h2>
      </div>
      <div className="mt-10 flex items-center justify-center gap-4 md:gap-6">
        <TimeBlock value={time.days} label="Days" />
        <span className="text-2xl font-bold text-muted-foreground/40">:</span>
        <TimeBlock value={time.hours} label="Hours" />
        <span className="text-2xl font-bold text-muted-foreground/40">:</span>
        <TimeBlock value={time.minutes} label="Min" />
        <span className="text-2xl font-bold text-muted-foreground/40">:</span>
        <TimeBlock value={time.seconds} label="Sec" />
      </div>
    </section>
  )
}

"use client"

import { useEffect, useState } from "react"

/** Start of election week (countdown target). */
const ELECTION_WEEK_START = new Date("2026-04-27T08:00:00")

function getTimeLeft() {
  const now = new Date()
  const diff = ELECTION_WEEK_START.getTime() - now.getTime()

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
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-inner ring-1 ring-primary-foreground/15 tabular-nums md:h-20 md:w-20 md:text-3xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
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
      <section className="bg-background px-6 py-16 text-center">
        <h2 className="font-serif text-3xl font-bold text-primary md:text-4xl">
          Election Week Is Here!
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Go vote during election week. Make your voice heard.
        </p>
      </section>
    )
  }

  return (
    <section className="bg-background px-6 py-16 text-center">
      <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl text-balance">
        Countdown to Election Week
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Begins April 27, 2026
      </p>
      <div className="mt-8 flex items-center justify-center gap-3 md:gap-6">
        <TimeBlock value={time.days} label="Days" />
        <span className="text-2xl font-bold text-muted-foreground">:</span>
        <TimeBlock value={time.hours} label="Hours" />
        <span className="text-2xl font-bold text-muted-foreground">:</span>
        <TimeBlock value={time.minutes} label="Minutes" />
        <span className="text-2xl font-bold text-muted-foreground">:</span>
        <TimeBlock value={time.seconds} label="Seconds" />
      </div>
    </section>
  )
}

"use client"

import { useEffect, useState } from "react"
import { DEFAULT_COUNTDOWN_SETTINGS } from "@/lib/countdown-settings"
import type { CountdownSettings } from "@/lib/countdown-settings"

function getTimeLeft(targetDate: string) {
  const now = new Date()
  const target = new Date(targetDate)
  const diff = target.getTime() - now.getTime()

  if (Number.isNaN(target.getTime()) || diff <= 0) {
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
  const [settings, setSettings] = useState<CountdownSettings>(DEFAULT_COUNTDOWN_SETTINGS)
  const [time, setTime] = useState(() => getTimeLeft(DEFAULT_COUNTDOWN_SETTINGS.targetDate))
  const target = new Date(settings.targetDate)
  const targetLabel = target.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const eventName = settings.mode === "day" ? "Election Day" : "Election Week"

  useEffect(() => {
    fetch("/api/countdown")
      .then((response) => response.json())
      .then((result: { countdown?: CountdownSettings }) => {
        if (result.countdown) {
          setSettings(result.countdown)
          setTime(getTimeLeft(result.countdown.targetDate))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeLeft(settings.targetDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [settings.targetDate])

  if (time.expired) {
    return (
      <section className="bg-background px-6 py-16 text-center">
        <h2 className="font-serif text-3xl font-bold text-primary md:text-4xl">
          {eventName} Is Here!
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Go vote. Make your voice heard.
        </p>
      </section>
    )
  }

  return (
    <section className="bg-background px-6 py-16 text-center">
      <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl text-balance">
        Countdown to {eventName}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {settings.mode === "day" ? "Election day" : "Begins"} {targetLabel}
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

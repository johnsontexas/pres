export type CountdownMode = "week" | "day"

export type CountdownSettings = {
  targetDate: string
  mode: CountdownMode
}

export const DEFAULT_COUNTDOWN_SETTINGS: CountdownSettings = {
  targetDate: "2026-04-27T08:00:00",
  mode: "week",
}

export function normalizeCountdownSettings(value: unknown): CountdownSettings {
  const settings = (value && typeof value === "object" ? value : {}) as {
    targetDate?: unknown
    mode?: unknown
  }
  const targetDate = String(settings.targetDate || DEFAULT_COUNTDOWN_SETTINGS.targetDate)
  const parsedDate = new Date(targetDate)

  return {
    targetDate: Number.isNaN(parsedDate.getTime())
      ? DEFAULT_COUNTDOWN_SETTINGS.targetDate
      : targetDate,
    mode: settings.mode === "day" ? "day" : "week",
  }
}

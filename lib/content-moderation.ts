const BLOCKED_WORDS = [
  "asshole",
  "bitch",
  "bullshit",
  "cunt",
  "dick",
  "fag",
  "fuck",
  "nigga",
  "nigger",
  "porn",
  "pussy",
  "retard",
  "shit",
  "slut",
  "whore",
]

function normalize(input: string) {
  return input
    .toLowerCase()
    .replace(/[@]/g, "a")
    .replace(/[!1|]/g, "i")
    .replace(/[$5]/g, "s")
    .replace(/[0]/g, "o")
    .replace(/[^a-z0-9\s]/g, "")
}

export function containsBlockedLanguage(input: string) {
  const clean = normalize(input)
  return BLOCKED_WORDS.some((word) => new RegExp(`\\b${word}\\b`, "i").test(clean))
}

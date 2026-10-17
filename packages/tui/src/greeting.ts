import { hostname, userInfo } from "node:os"
import { Locale } from "./util/locale"

// Flat block letters, same three row technique as the wordmark: half blocks draw
// the rounded edges, "_" punches a shadow cell inside a letter and "~" leaves a
// shadow on the bottom row where the letter does not reach.
const GLYPHS: Record<string, readonly [string, string, string]> = {
  A: ["▄▀▀▄", "█▀▀█", "▀~~▀"],
  B: ["█▀▀▄", "█▀▀▄", "▀▀▀▀"],
  C: ["▄▀▀▀", "█___", "▀▀▀▀"],
  D: ["█▀▀▄", "█__█", "▀▀▀▀"],
  E: ["█▀▀▀", "█^^^", "▀▀▀▀"],
  H: ["█__█", "█▀▀█", "▀~~▀"],
  I: ["▀▀▀▀", "_██_", "▀▀▀▀"],
  L: ["█___", "█___", "▀▀▀▀"],
  N: ["█▄_█", "█_▀█", "▀~~▀"],
  O: ["█▀▀█", "█__█", "▀▀▀▀"],
  S: ["▄▀▀ ", "▀▀▀▄", " ▀▀▀"],
  U: ["█__█", "█__█", "▀▀▀▀"],
}

export const GREETINGS = ["HOLA", "HELLO", "ALOHA", "BUENAS", "SALUDOS", "CIAO", "BUEN DIA"]

const LETTER_WIDTH = 5

// Chosen once per process so the greeting rotates on every launch.
export const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)] ?? "HOLA"

export const computerName = hostname().replace(/\.local$/i, "")

// Login names are lower case by convention; the heading reads better titlecased.
export const userName = Locale.titlecase(userInfo().username)

export function art(word: string) {
  return [0, 1, 2].map((row) => [...word].map((char) => GLYPHS[char]?.[row] ?? "    ").join(" "))
}

export function artWidth(word: string) {
  return word.length * LETTER_WIDTH - 1
}

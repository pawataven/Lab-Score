import { defineEventHandler, getQuery, createError } from "h3"
import { apiFootballFetch } from "../utils/apiFootball"

type Query = {
  date?: string
  leagues?: string // "39,140,135"
  timezone?: string
}

const DEFAULTS = {
  timezone: "Asia/Bangkok",
} as const

// ลีกที่เว็บคุณรองรับ (default)
const DEFAULT_LEAGUES = [39, 140, 135, 78, 61, 292] as const

function badRequest(message: string) {
  throw createError({ statusCode: 400, statusMessage: message })
}

function assertDate(date?: string): string {
  if (!date) badRequest("Missing required query: date")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date!)) badRequest("Invalid date format (YYYY-MM-DD)")
  return date!
}

function parseLeagues(leagues?: string): number[] {
  if (!leagues) return [...DEFAULT_LEAGUES]
  const ids = leagues
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
  return ids.length ? ids : [...DEFAULT_LEAGUES]
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as Query

  const date = assertDate(q.date)
  const timezone = q.timezone || DEFAULTS.timezone
  const leagueIds = parseLeagues(q.leagues)

  const data: any = await apiFootballFetch("/fixtures", { date, timezone })

  const arr = Array.isArray(data?.response) ? data.response : []
  const filtered = arr.filter(
    (fx: any) => typeof fx?.league?.id === "number" && leagueIds.includes(fx.league.id)
  )

  return { ...data, response: filtered }
})

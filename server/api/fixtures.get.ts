import { defineEventHandler, getQuery, createError } from "h3"
import { apiFootballFetch } from "../../app/utils/apiFootball"

type Query = {
  date?: string
  leagues?: string
  timezone?: string
  cutoff?: string // ชั่วโมงตัดวัน (default 5)
  debug?: string // "1"
}

const DEFAULTS = {
  timezone: "Asia/Bangkok",
  cutoffHour: 5, // 05:00 คือเส้นตัดวัน
} as const

function badRequest(message: string) {
  throw createError({ statusCode: 400, statusMessage: message })
}

function assertDate(date?: string): string {
  if (!date) badRequest("Missing required query: date")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date!)) {
    badRequest("Invalid date format (YYYY-MM-DD)")
  }
  return date!
}

function parseLeagues(leagues?: string): number[] {
  if (!leagues) return []
  return leagues
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
}

function parseCutoffHour(cutoff?: string) {
  if (!cutoff) return DEFAULTS.cutoffHour
  const n = Number(cutoff)
  if (!Number.isFinite(n)) return DEFAULTS.cutoffHour
  return Math.max(0, Math.min(12, Math.floor(n)))
}

function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00+07:00`)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/**
 * Matchday window:
 * date@cutoffHour -> (date+1)@cutoffHour
 */
function inMatchdayWindow(iso: string, date: string, cutoffHour: number) {
  const h = String(cutoffHour).padStart(2, "0")
  const start = new Date(`${date}T${h}:00:00+07:00`).getTime()
  const end = new Date(`${addDays(date, 1)}T${h}:00:00+07:00`).getTime()
  const t = new Date(iso).getTime()
  return t >= start && t < end
}

function uniqByFixtureId(arr: any[]) {
  const m = new Map<number, any>()
  for (const fx of arr) {
    const id = fx?.fixture?.id
    if (typeof id === "number" && !m.has(id)) m.set(id, fx)
  }
  return [...m.values()]
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as Query

  const date = assertDate(q.date)
  const timezone = q.timezone || DEFAULTS.timezone
  const cutoffHour = parseCutoffHour(q.cutoff)
  const leagueIds = parseLeagues(q.leagues)
  const debug = q.debug === "1"

  const nextDate = addDays(date, 1)

  // -----------------------
  // 1) Try best: from/to
  // -----------------------
  let data: any = null
  let arr: any[] = []
  let usedMode: "fromTo" | "twoDates" = "fromTo"

  try {
    data = await apiFootballFetch("/fixtures", { from: date, to: nextDate, timezone })
    arr = Array.isArray(data?.response) ? data.response : []
  } catch (e) {
    // ignore and fallback below
  }

  // ถ้า from/to ใช้ไม่ได้ (แพ็กเกจบางอัน), response มักว่างหรือมี errors
  const hasPlanError =
    !!data?.errors && (Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors).length > 0)

  if (!arr.length || hasPlanError) {
    
    usedMode = "twoDates"

    const [d1, d2] = await Promise.allSettled([
      apiFootballFetch("/fixtures", { date, timezone }),
      apiFootballFetch("/fixtures", { date: nextDate, timezone }),
    ])

    const r1 = d1.status === "fulfilled"
      ? (Array.isArray((d1.value as any).response) ? (d1.value as any).response : [])
      : []

    const r2 = d2.status === "fulfilled"
      ? (Array.isArray((d2.value as any ).response) ? (d2.value as any).response : []) 
      : []

    // เอา data หลักจาก call แรก (ไว้ส่ง paging/get/parameters)
    data = d1.status === "fulfilled" ? d1.value : (d2.status === "fulfilled" ? d2.value : { response: [] })
    arr = uniqByFixtureId([...r1, ...r2])
  }

  // กรองด้วย matchday window
  const windowed = arr.filter((fx: any) => {
    const iso = fx?.fixture?.date
    return typeof iso === "string" && inMatchdayWindow(iso, date, cutoffHour)
  })

  // กรองลีก (ถ้าส่งมา)
  const filtered =
    leagueIds.length === 0
      ? windowed
      : windowed.filter(
        (fx: any) => typeof fx?.league?.id === "number" && leagueIds.includes(fx.league.id)
      )

  if (debug) {
    return {
      date,
      timezone,
      cutoffHour,
      usedMode,
      nextDate,
      requestedLeagues: leagueIds,
      counts: {
        fetchedTotal: arr.length,
        afterWindow: windowed.length,
        afterLeague: filtered.length,
      },
      sample: filtered.slice(0, 3),
      response: filtered,
    }
  }

  return { ...data, response: filtered }
})

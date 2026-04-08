import { createError, defineEventHandler, getQuery } from "h3"
import { apiFootballFetch } from "../../app/utils/apiFootball"
import { addDays, BUSINESS_DAY_CUTOFF_HOUR, BUSINESS_TIME_ZONE } from "../../app/utils/date"

type QueryParams = {
  date?: string
  leagues?: string
  timezone?: string
}

type ProviderErrors = any[] | Record<string, any> | undefined

type FixtureRecord = {
  fixture?: {
    id?: number
    date?: string
  }
  league?: {
    id?: number
  }
  [key: string]: any
}

type FixtureResponse = {
  get: string
  parameters: Record<string, any>
  errors?: ProviderErrors
  results: number
  response: FixtureRecord[]
}

function validateDate(date?: string): string {
  if (!date) {
    throw createError({ statusCode: 400, statusMessage: "Missing 'date' parameter" })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid date format. Use YYYY-MM-DD" })
  }
  return date
}

function parseLeagueIds(leaguesStr?: string): number[] {
  if (!leaguesStr) return []
  return leaguesStr
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0)
}

function normalizeErrors(errors: ProviderErrors): Record<string, any> {
  if (!errors) return {}
  if (Array.isArray(errors)) {
    return errors.length > 0 ? { list: errors } : {}
  }
  return errors
}

function hasProviderErrors(errors: ProviderErrors): boolean {
  if (Array.isArray(errors)) return errors.length > 0
  return !!(errors && Object.keys(errors).length > 0)
}

function mergeErrors(...items: ProviderErrors[]): Record<string, any> {
  return items.reduce<Record<string, any>>((acc, item) => {
    const normalized = normalizeErrors(item)

    for (const [key, value] of Object.entries(normalized)) {
      if (key === "list" && Array.isArray(value)) {
        acc.list = [...(Array.isArray(acc.list) ? acc.list : []), ...value]
        continue
      }
      acc[key] = value
    }

    return acc
  }, {})
}

function dedupeFixtures(fixtures: FixtureRecord[]): FixtureRecord[] {
  const seenFixtureIds = new Set<number>()
  const result: FixtureRecord[] = []

  for (const fixture of fixtures) {
    const fixtureId = fixture.fixture?.id

    if (typeof fixtureId === "number") {
      if (seenFixtureIds.has(fixtureId)) continue
      seenFixtureIds.add(fixtureId)
    }

    result.push(fixture)
  }

  return result
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(timeZone)
  if (cached) return cached

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })

  formatterCache.set(timeZone, formatter)
  return formatter
}

function getZonedParts(input: string, timeZone: string) {
  const parts = getFormatter(timeZone).formatToParts(new Date(input))
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
  }
}

function toIsoDate(parts: { year: number; month: number; day: number }): string {
  const month = String(parts.month).padStart(2, "0")
  const day = String(parts.day).padStart(2, "0")
  return `${parts.year}-${month}-${day}`
}

function filterFixturesForRequestedDate(
  fixtures: FixtureRecord[],
  requestedDate: string,
  nextCalendarDate: string,
  timeZone: string,
): FixtureRecord[] {
  return fixtures.filter((fixture) => {
    const kickoff = fixture.fixture?.date
    if (!kickoff) return false

    const parts = getZonedParts(kickoff, timeZone)
    const calendarDate = toIsoDate(parts)

    if (calendarDate === requestedDate) {
      return true
    }

    return calendarDate === nextCalendarDate && parts.hour < BUSINESS_DAY_CUTOFF_HOUR
  })
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as QueryParams

  const businessDate = validateDate(query.date)
  const targetTimezone = query.timezone || BUSINESS_TIME_ZONE
  const targetLeagueIds = parseLeagueIds(query.leagues)
  const nextCalendarDate = addDays(businessDate, 1)

  try {
    const currentDayData = (await apiFootballFetch("/fixtures", {
      date: businessDate,
      timezone: targetTimezone,
    })) as FixtureResponse

    const nextDayResult = await Promise.allSettled([
      apiFootballFetch("/fixtures", {
        date: nextCalendarDate,
        timezone: targetTimezone,
      }),
    ])

    const secondaryResult = nextDayResult[0]
    const nextDayData = secondaryResult.status === "fulfilled"
      ? secondaryResult.value as FixtureResponse
      : undefined

    const currentDayErrors = normalizeErrors(currentDayData.errors)
    if (hasProviderErrors(currentDayErrors)) {
      console.error("[API-Football Error]:", {
        currentDayErrors,
      })

      return {
        results: 0,
        response: [],
        errors: currentDayErrors,
        meta: {
          date: businessDate,
          timezone: targetTimezone,
          fetchDates: [businessDate],
          error: "Provider Error",
        },
      }
    }

    const nextDayErrors = nextDayData?.errors
    const canUseNextDay = secondaryResult.status === "fulfilled" && !hasProviderErrors(nextDayErrors)
    const errors = canUseNextDay ? mergeErrors(currentDayErrors, nextDayErrors) : currentDayErrors

    if (secondaryResult.status === "rejected" || hasProviderErrors(nextDayErrors)) {
      console.warn("[API-Football Warning]: next-day fetch skipped", {
        nextCalendarDate,
        reason: secondaryResult.status === "rejected" ? secondaryResult.reason : nextDayErrors,
      })
    }

    let matches = dedupeFixtures([
      ...(currentDayData.response || []),
      ...(canUseNextDay ? (nextDayData?.response || []) : []),
    ])

    matches = filterFixturesForRequestedDate(matches, businessDate, nextCalendarDate, targetTimezone)

    if (targetLeagueIds.length > 0) {
      matches = matches.filter((match) => {
        const leagueId = match.league?.id
        return typeof leagueId === "number" && targetLeagueIds.includes(leagueId)
      })
    }

    return {
      results: matches.length,
      response: matches,
      errors,
      meta: {
        date: businessDate,
        timezone: targetTimezone,
        fetchDates: canUseNextDay ? [businessDate, nextCalendarDate] : [businessDate],
        source: canUseNextDay ? "calendar-plus-early-next-day" : "calendar-day-with-fallback",
      },
    }
  } catch (error: any) {
    console.error("[Server Error] Failed to fetch fixtures:", error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Internal Server Error",
      data: error.data || error.message,
    })
  }
})

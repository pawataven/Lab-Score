import { createError, defineEventHandler, getQuery } from "h3"
import { apiFootballFetch } from "../../app/utils/apiFootball"
import { BUSINESS_QUERY_TIME_ZONE, BUSINESS_TIME_ZONE, getBusinessDateString } from "../../app/utils/date"

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
export default defineEventHandler(async (event) => {
  const query = getQuery(event) as QueryParams

  const businessDate = validateDate(query.date)
  const targetTimezone = query.timezone || BUSINESS_TIME_ZONE
  const todayBusinessDate = getBusinessDateString()
  const providerQueryTimezone = targetTimezone === BUSINESS_TIME_ZONE
    ? (businessDate > todayBusinessDate ? BUSINESS_QUERY_TIME_ZONE : BUSINESS_TIME_ZONE)
    : targetTimezone
  const targetLeagueIds = parseLeagueIds(query.leagues)

  try {
    const currentDayData = (await apiFootballFetch("/fixtures", {
      date: businessDate,
      timezone: providerQueryTimezone,
    })) as FixtureResponse

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
          providerQueryTimezone,
          fetchDates: [businessDate],
          totalOnDate: 0,
          error: "Provider Error",
        },
      }
    }

    let matches = dedupeFixtures(currentDayData.response || [])

    if (targetLeagueIds.length > 0) {
      matches = matches.filter((match) => {
        const leagueId = match.league?.id
        return typeof leagueId === "number" && targetLeagueIds.includes(leagueId)
      })
    }

    return {
      results: matches.length,
      response: matches,
      errors: currentDayErrors,
      meta: {
        date: businessDate,
        timezone: targetTimezone,
        providerQueryTimezone,
        fetchDates: [businessDate],
        totalOnDate: typeof currentDayData.results === "number" ? currentDayData.results : (currentDayData.response?.length || 0),
        source: "business-day-single-request",
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

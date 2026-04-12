import { createError, defineEventHandler, getQuery } from "h3"
import { apiFootballFetch } from "../../app/utils/apiFootball"
import { BUSINESS_QUERY_TIME_ZONE, BUSINESS_TIME_ZONE } from "../../app/utils/date"

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
export default defineEventHandler(async (event) => {
  const query = getQuery(event) as QueryParams

  const businessDate = validateDate(query.date)
  const targetTimezone = query.timezone || BUSINESS_TIME_ZONE
  const targetLeagueIds = parseLeagueIds(query.leagues)
  const shouldMergeBusinessWindow = targetTimezone === BUSINESS_TIME_ZONE
  const providerQueryTimezones = shouldMergeBusinessWindow
    ? [BUSINESS_TIME_ZONE, BUSINESS_QUERY_TIME_ZONE]
    : [targetTimezone]

  try {
    const fetchResults = await Promise.allSettled(
      providerQueryTimezones.map((timezone) =>
        apiFootballFetch("/fixtures", {
          date: businessDate,
          timezone,
        }) as Promise<FixtureResponse>
      ),
    )

    const fulfilledResponses = fetchResults
      .filter((result): result is PromiseFulfilledResult<FixtureResponse> => result.status === "fulfilled")
      .map((result) => result.value)

    const successfulResponses = fulfilledResponses.filter((response) => !hasProviderErrors(response.errors))
    const mergedErrors = mergeErrors(
      ...fulfilledResponses.map((response) => response.errors),
      ...fetchResults
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map((result) => ({ list: [String(result.reason)] })),
    )

    if (successfulResponses.length === 0) {
      console.error("[API-Football Error]:", {
        mergedErrors,
        providerQueryTimezones,
      })

      return {
        results: 0,
        response: [],
        errors: mergedErrors,
        meta: {
          date: businessDate,
          timezone: targetTimezone,
          providerQueryTimezones,
          fetchDates: providerQueryTimezones.map(() => businessDate),
          totalOnDate: 0,
          error: "Provider Error",
        },
      }
    }

    let matches = dedupeFixtures(
      successfulResponses.flatMap((response) => response.response || [])
    )

    if (targetLeagueIds.length > 0) {
      matches = matches.filter((match) => {
        const leagueId = match.league?.id
        return typeof leagueId === "number" && targetLeagueIds.includes(leagueId)
      })
    }

    return {
      results: matches.length,
      response: matches,
      errors: mergedErrors,
      meta: {
        date: businessDate,
        timezone: targetTimezone,
        providerQueryTimezones,
        fetchDates: providerQueryTimezones.map(() => businessDate),
        totalOnDate: successfulResponses.reduce((sum, response) => {
          const responseCount = typeof response.results === "number" ? response.results : (response.response?.length || 0)
          return sum + responseCount
        }, 0),
        source: shouldMergeBusinessWindow ? "calendar-plus-business-window" : "calendar-day-single-request",
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

import { createError, defineEventHandler, getQuery } from "h3"
import { apiFootballFetch } from "../../app/utils/apiFootball"
import { getBusinessDate } from "../../app/utils/date"

type QueryParams = {
  league?: string
  season?: string
}

type StandingRow = {
  rank: number
  name: string
  logo: string
  played: number
  win: number
  draw: number
  lose: number
  goalsFor: number
  goalsAgainst: number
  goalsDiff: number
  points: number
  form: string[]
}

type ProviderStanding = {
  rank?: number
  points?: number
  form?: string
  all?: {
    played?: number
    win?: number
    draw?: number
    lose?: number
    goals?: {
      for?: number
      against?: number
    }
  }
  team?: {
    name?: string
    logo?: string
  }
}

type StandingsResponse = {
  errors?: Record<string, any> | any[]
  response?: Array<{
    league?: {
      id?: number
      name?: string
      country?: string
      logo?: string
      season?: number
      standings?: ProviderStanding[][]
    }
  }>
}

function parseLeagueId(rawLeague?: string): number {
  const leagueId = Number(rawLeague)
  if (!Number.isFinite(leagueId) || leagueId <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Invalid 'league' parameter" })
  }
  return leagueId
}

function parseSeason(rawSeason?: string): number {
  if (!rawSeason) {
    const now = getBusinessDate()
    return now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1
  }
  const season = Number(rawSeason)
  if (!Number.isFinite(season) || season < 1900 || season > 3000) {
    throw createError({ statusCode: 400, statusMessage: "Invalid 'season' parameter" })
  }
  return season
}

function toStandingRow(item: ProviderStanding): StandingRow {
  return {
    rank: item.rank ?? 0,
    name: item.team?.name ?? "-",
    logo: item.team?.logo ?? "",
    played: item.all?.played ?? 0,
    win: item.all?.win ?? 0,
    draw: item.all?.draw ?? 0,
    lose: item.all?.lose ?? 0,
    goalsFor: item.all?.goals?.for ?? 0,
    goalsAgainst: item.all?.goals?.against ?? 0,
    goalsDiff: (item.all?.goals?.for ?? 0) - (item.all?.goals?.against ?? 0),
    points: item.points ?? 0,
    form: (item.form ?? "")
      .split("")
      .map((x) => x.toUpperCase())
      .filter((x) => x === "W" || x === "D" || x === "L")
      .slice(0, 5),
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as QueryParams
  const leagueId = parseLeagueId(query.league)
  const season = parseSeason(query.season)

  try {
    const data = (await apiFootballFetch("/standings", {
      league: leagueId,
      season,
    })) as StandingsResponse

    const hasErrors = Array.isArray(data.errors)
      ? data.errors.length > 0
      : !!(data.errors && Object.keys(data.errors).length > 0)

    if (hasErrors) {
      return {
        standings: [],
        league: null,
        meta: { leagueId, season, error: "Provider Error" },
      }
    }

    const league = data.response?.[0]?.league
    const table = league?.standings?.[0] ?? []

    return {
      standings: table.map(toStandingRow),
      league: league
        ? {
            id: league.id ?? leagueId,
            name: league.name ?? "",
            country: league.country ?? "",
            logo: league.logo ?? "",
            season: league.season ?? null,
          }
        : null,
      meta: {
        leagueId,
        season,
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: "Internal Server Error",
      data: error.message,
    })
  }
})

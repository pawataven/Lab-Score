import type { ApiFixture, LeagueGroup, StatusFilter } from '~/types/fixture'
import { filterMatchesByStatus, toMatchModel } from '~/utils/match'

type BuildLeagueGroupsOptions = {
  fixtures?: ApiFixture[] | null
  leagueIds: number[]
  statusFilter?: StatusFilter
  pageDate?: string
}

export function buildLeagueGroups({
  fixtures,
  leagueIds,
  statusFilter = 'all',
  pageDate,
}: BuildLeagueGroupsOptions): LeagueGroup[] {
  if (!Array.isArray(fixtures) || leagueIds.length === 0) {
    return []
  }

  const allowedLeagueIds = new Set<number>(leagueIds)
  const groups = new Map<number, ApiFixture[]>()

  for (const fixture of fixtures) {
    const leagueId = fixture?.league?.id
    if (typeof leagueId !== 'number' || !allowedLeagueIds.has(leagueId)) continue
    if (!groups.has(leagueId)) groups.set(leagueId, [])
    groups.get(leagueId)!.push(fixture)
  }

  const result: LeagueGroup[] = []

  for (const [leagueId, items] of groups.entries()) {
    const first = items[0]
    let matches = items.map((item) => toMatchModel(item, pageDate))

    if (statusFilter !== 'all') {
      matches = filterMatchesByStatus(matches, statusFilter)
    }

    if (matches.length === 0) continue

    const liveCount = matches.filter((match) => match.status === 'LIVE').length

    result.push({
      id: leagueId,
      name: first?.league?.name ?? 'Unknown',
      country: first?.league?.country ?? '',
      season: first?.league?.season != null ? String(first.league.season) : '-',
      logo: first?.league?.logo ?? '',
      liveCount,
      matches,
    })
  }

  return result.sort((a, b) => (b.liveCount - a.liveCount) || (b.matches.length - a.matches.length))
}

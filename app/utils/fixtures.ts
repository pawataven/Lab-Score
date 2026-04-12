import type { ApiFixture, LeagueGroup, Match, MatchSection, StatusFilter } from '~/types/fixture'
import { addDays, getBusinessDateString } from '~/utils/date'
import { formatSectionDate } from '~/utils/matchLabel'
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
    let matches = items
      .map((item) => toMatchModel(item))
      .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())

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
      sections: buildMatchSections(matches, pageDate),
    })
  }

  return result.sort((a, b) => (b.liveCount - a.liveCount) || (b.matches.length - a.matches.length))
}

function buildMatchSections(matches: Match[], pageDate?: string): MatchSection[] {
  const sections = new Map<string, MatchSection>()
  const todayBusinessDate = getBusinessDateString()
  const nextCalendarDate = pageDate ? addDays(pageDate, 1) : ''

  for (const match of matches) {
    const section = getMatchSection(match, pageDate, todayBusinessDate, nextCalendarDate)
    const existing = sections.get(section.key)

    if (existing) {
      existing.matches.push(match)
      continue
    }

    sections.set(section.key, {
      key: section.key,
      title: section.title,
      matches: [match],
    })
  }

  return Array.from(sections.values())
}

function getMatchSection(
  match: Match,
  pageDate: string | undefined,
  todayBusinessDate: string,
  nextCalendarDate: string,
): Pick<MatchSection, 'key' | 'title'> {
  if (!pageDate) {
    return {
      key: `time:${match.label}`,
      title: match.label,
    }
  }

  if (match.calendarDate === nextCalendarDate && match.hour < 5) {
    return {
      key: `next-early:${match.calendarDate}`,
      title: `เช้ามืด (${formatSectionDate(new Date(`${match.calendarDate}T00:00:00+07:00`))})`,
    }
  }

  if (match.calendarDate === pageDate && match.label === 'ค่ำ' && pageDate === todayBusinessDate) {
    return {
      key: 'context:tonight',
      title: 'คืนนี้',
    }
  }

  return {
    key: `time:${match.label}`,
    title: match.label,
  }
}

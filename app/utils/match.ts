import type { ApiFixture, Match, MatchStatus } from '~/types/fixture'
import { BUSINESS_TIME_ZONE } from '~/utils/date'
import { getMatchCalendarDate, getMatchTimeLabel, getZonedDateParts } from '~/utils/matchLabel'

export function formatTimeHHmm(iso: string): string {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: BUSINESS_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })

  return formatter.format(new Date(iso))
}

function getMatchStatus(short: string): MatchStatus {
  if (short === 'NS') return 'UPCOMING'
  if (['FT', 'AET', 'PEN'].includes(short)) return 'FT'
  return 'LIVE'
}

export function toMatchModel(fx: ApiFixture, pageDate?: string): Match {
  const short = fx.fixture?.status?.short ?? ''
  const elapsed = fx.fixture?.status?.elapsed
  const kickoff = fx.fixture.date
  const kickoffDate = new Date(kickoff)
  const status = getMatchStatus(short)
  const parts = getZonedDateParts(kickoffDate, BUSINESS_TIME_ZONE)
  const labelInfo = status === 'UPCOMING'
    ? getMatchTimeLabel(kickoff, pageDate)
    : null
  const timeDisplay = short === 'NS'
    ? formatTimeHHmm(kickoff)
    : typeof elapsed === 'number'
      ? `${elapsed}'`
      : short || '-'

  return {
    id: fx.fixture.id,
    kickoff,
    hour: parts.hour,
    calendarDate: getMatchCalendarDate(kickoffDate),
    timeDisplay,
    status,
    statusText: short,
    label: labelInfo?.label ?? null,
    labelWithDate: labelInfo?.labelWithDate ?? null,
    labelClassName: labelInfo?.className ?? null,
    home: {
      name: fx.teams?.home?.name ?? '-',
      score: fx.goals?.home ?? 0,
      logo: fx.teams?.home?.logo ?? '',
    },
    away: {
      name: fx.teams?.away?.name ?? '-',
      score: fx.goals?.away ?? 0,
      logo: fx.teams?.away?.logo ?? '',
    },
  }
}

export function filterMatchesByStatus(matches: Match[], filter: string): Match[] {
  if (filter === 'all') return matches
  if (filter === 'live') return matches.filter((match) => match.status === 'LIVE')
  if (filter === 'upcoming') return matches.filter((match) => match.status === 'UPCOMING')
  if (filter === 'finished') return matches.filter((match) => match.status === 'FT')
  return matches
}

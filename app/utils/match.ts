import type { ApiFixture, Match, MatchStatus } from '~/types/fixture'
import { getMatchCalendarDate, getMatchTimeLabel, getZonedDateParts } from '~/utils/matchLabel'
import { BUSINESS_TIME_ZONE } from '~/utils/date'

// Format time from ISO string to HH:mm
export function formatTimeHHmm(iso: string): string {
<<<<<<< Updated upstream
  const parts = getZonedDateParts(new Date(iso), BUSINESS_TIME_ZONE)
  return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`
=======
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })

  return formatter.format(new Date(iso))
>>>>>>> Stashed changes
}

// Determine match status from API status short
function getMatchStatus(short: string): MatchStatus {
  if (short === 'NS') return 'UPCOMING'
  if (['FT', 'AET', 'PEN'].includes(short)) return 'FT'
  return 'LIVE'
}

// Transform API fixture to Match model
export function toMatchModel(fx: ApiFixture): Match {
  const short = fx.fixture?.status?.short ?? ''
  const elapsed = fx.fixture?.status?.elapsed
<<<<<<< Updated upstream
  const matchDate = new Date(fx.fixture.date)
  const parts = getZonedDateParts(matchDate, BUSINESS_TIME_ZONE)
=======
>>>>>>> Stashed changes
  const status = getMatchStatus(short)
  const labelInfo = pageDate && status === 'UPCOMING'
    ? getMatchTimeLabel(fx.fixture.date, pageDate)
    : null
  const timeDisplay = short === 'NS'
    ? formatTimeHHmm(fx.fixture.date)
    : typeof elapsed === 'number'
      ? `${elapsed}'`
      : short || '-'

  return {
    id: fx.fixture.id,
    kickoff: fx.fixture.date,
    hour: parts.hour,
    calendarDate: getMatchCalendarDate(matchDate),
    timeDisplay,
    status,
    statusText: short,
<<<<<<< Updated upstream
    label: getMatchTimeLabel(matchDate),
=======
    label: labelInfo?.label ?? null,
    labelWithDate: labelInfo?.labelWithDate ?? null,
    labelClassName: labelInfo?.className ?? null,
>>>>>>> Stashed changes
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

// Filter matches by status
export function filterMatchesByStatus(matches: Match[], filter: string): Match[] {
  if (filter === 'all') return matches
  if (filter === 'live') return matches.filter(m => m.status === 'LIVE')
  if (filter === 'upcoming') return matches.filter(m => m.status === 'UPCOMING')
  if (filter === 'finished') return matches.filter(m => m.status === 'FT')
  return matches
}

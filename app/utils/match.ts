import type { ApiFixture, Match, MatchStatus } from '~/types/fixture'
import { getMatchTimeLabel } from '~/utils/matchLabel'

// Format time from ISO string to HH:mm
export function formatTimeHHmm(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Determine match status from API status short
function getMatchStatus(short: string): MatchStatus {
  if (short === 'NS') return 'UPCOMING'
  if (['FT', 'AET', 'PEN'].includes(short)) return 'FT'
  return 'LIVE'
}

// Transform API fixture to Match model
export function toMatchModel(fx: ApiFixture, pageDate?: string): Match {
  const short = fx.fixture?.status?.short ?? ''
  const elapsed = fx.fixture?.status?.elapsed
  const matchDate = new Date(fx.fixture.date)
  const status = getMatchStatus(short)
  const timeDisplay = short === 'NS'
    ? formatTimeHHmm(fx.fixture.date)
    : typeof elapsed === 'number'
      ? `${elapsed}'`
      : short || '-'

  return {
    id: fx.fixture.id,
    timeDisplay,
    status,
    statusText: short,
    label: pageDate && status === 'UPCOMING' ? getMatchTimeLabel(matchDate, pageDate) : null,
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

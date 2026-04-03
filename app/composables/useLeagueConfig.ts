import type { LeagueConfig } from '~/types/fixture'

// League configuration - UI display
export const LEAGUES_UI: LeagueConfig[] = [
  { id: 'ucl', name: 'Champions League', logo: 'https://media.api-sports.io/football/leagues/2.png' },
  { id: 'epl', name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
  { id: 'laliga', name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png' },
  { id: 'seriea', name: 'Serie A', logo: 'https://media.api-sports.io/football/leagues/135.png' },
  { id: 'bundes', name: 'Bundesliga', logo: 'https://media.api-sports.io/football/leagues/78.png' },
  { id: 'thaileagueone', name: 'Thai League 1', logo: 'https://media.api-sports.io/football/leagues/296.png' },
  { id: 'ligue1', name: 'Ligue 1', logo: 'https://media.api-sports.io/football/leagues/61.png' },
]

// League slug to API ID mapping
export const LEAGUE_SLUG_TO_ID = {
  ucl: 2,
  epl: 39,
  laliga: 140,
  seriea: 135,
  bundes: 78,
  thaileagueone: 296,
  ligue1: 61,
} as const

export type LeagueSlug = keyof typeof LEAGUE_SLUG_TO_ID
export type LeagueId = typeof LEAGUE_SLUG_TO_ID[LeagueSlug]

// Default selected leagues
export const DEFAULT_SELECTED_LEAGUES: LeagueSlug[] = ['ucl', 'epl', 'laliga', 'seriea', 'bundes', 'thaileagueone', 'ligue1']

export function useLeagueConfig() {
  const selectedLeagues = ref<string[]>([...DEFAULT_SELECTED_LEAGUES])

  const selectedLeagueIds = computed(() =>
    selectedLeagues.value
      .map((slug) => LEAGUE_SLUG_TO_ID[slug as LeagueSlug])
      .filter((id): id is LeagueId => typeof id === 'number')
  )

  function resetLeagues() {
    selectedLeagues.value = [...DEFAULT_SELECTED_LEAGUES]
  }

  return {
    leaguesUI: LEAGUES_UI,
    selectedLeagues,
    selectedLeagueIds,
    resetLeagues,
  }
}

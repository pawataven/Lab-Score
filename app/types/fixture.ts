// Types for fixture/match data

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'FT'
export type TimeLabel = 'เช้ามืด' | 'เช้า' | 'บ่าย' | 'ค่ำ'

export interface Team {
  name: string
  score: number
  logo: string
}

export interface Match {
  id: number
  kickoff: string
  hour: number
  calendarDate: string
  timeDisplay: string
  status: MatchStatus
  statusText: string
<<<<<<< Updated upstream
  label: TimeLabel
=======
  label: string | null
  labelWithDate: string | null
  labelClassName: string | null
>>>>>>> Stashed changes
  home: Team
  away: Team
}

export interface MatchSection {
  key: string
  title: string
  matches: Match[]
}

export interface LeagueGroup {
  id: number
  name: string
  country: string
  season: string
  logo: string
  liveCount: number
  matches: Match[]
  sections: MatchSection[]
}

export interface LeagueConfig {
  id: string
  name: string
  logo: string
}

export type ProviderErrorMap = Record<string, unknown>
export type ProviderErrors = ProviderErrorMap | string[]

// API Response types
export interface FixtureApiResponse {
  errors?: ProviderErrors
  response?: ApiFixture[]
  results?: number
  meta?: {
    date: string
    source: string
  }
}

export interface ApiFixture {
  fixture: {
    id: number
    date: string
    status: {
      short: string
      elapsed?: number
    }
  }
  league: {
    id: number
    name: string
    country: string
    season?: number
    logo: string
  }
  teams: {
    home: { name: string; logo: string }
    away: { name: string; logo: string }
  }
  goals: {
    home?: number
    away?: number
  }
}

export type StatusFilter = 'all' | 'live' | 'upcoming' | 'finished'

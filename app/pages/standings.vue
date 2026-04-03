<script setup lang="ts">
import type { LeagueSlug } from '~/composables/useLeagueConfig'
import { LEAGUE_SLUG_TO_ID } from '~/composables/useLeagueConfig'
import StandingsTableVue from '~/components/Standings/StandingsTable.vue'

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

type StandingsApiResponse = {
  standings: StandingRow[]
  league: {
    id: number
    name: string
    country: string
    logo: string
    season: number
  } | null
}

const selectedLeague = ref<LeagueSlug>('epl')

const leagues: Array<{ id: LeagueSlug; name: string; country: string; logo: string }> = [
  { id: 'epl', name: 'Premier League', country: 'England', logo: 'https://media.api-sports.io/football/leagues/39.png' },
  { id: 'laliga', name: 'La Liga', country: 'Spain', logo: 'https://media.api-sports.io/football/leagues/140.png' },
  { id: 'bundes', name: 'Bundesliga', country: 'Germany', logo: 'https://media.api-sports.io/football/leagues/78.png' },
  { id: 'seriea', name: 'Serie A', country: 'Italy', logo: 'https://media.api-sports.io/football/leagues/135.png' },
  { id: 'ligue1', name: 'Ligue 1', country: 'France', logo: 'https://media.api-sports.io/football/leagues/61.png' },
]

const currentLeague = computed(() => leagues.find((l) => l.id === selectedLeague.value))
const currentLeagueId = computed(() => LEAGUE_SLUG_TO_ID[selectedLeague.value])
const now = new Date()
const season = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1

const { data, pending, error, refresh } = useFetch<StandingsApiResponse>('/api/standings', {
  query: computed(() => ({
    league: String(currentLeagueId.value),  
    season: String(season),
  })),
  key: computed(() => `standings:${selectedLeague.value}:${season}`),
  watch: [selectedLeague],
  server: false,
  lazy: true,
})

const standings = computed(() => data.value?.standings ?? [])
const leagueTitle = computed(() => data.value?.league?.name || currentLeague.value?.name || '')
const leagueCountry = computed(() => data.value?.league?.country || currentLeague.value?.country || '')
const leagueLogo = computed(() => data.value?.league?.logo || currentLeague.value?.logo || '')
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>

<template>
  <div class="mx-auto max-w-7xl p-4 md:p-6 min-h-screen">
    
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span class="p-2 bg-orange-100 rounded-lg text-[#f97316]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        ตารางคะแนน
      </h1>
      <p class="text-sm text-gray-500 mt-1 ml-12">อัปเดตล่าสุด: ฤดูกาล {{ season }}-{{ String((season + 1) % 100).padStart(2, '0') }}</p>
    </div>

    <div class="mb-6">
      <div class="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          v-for="league in leagues" 
          :key="league.id"
          @click="selectedLeague = league.id"
          class="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap"
          :class="selectedLeague === league.id 
            ? 'bg-[#f97316] text-white border-[#f97316] shadow-md' 
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
        >
          <img :src="league.logo" class="w-4 h-4 object-contain brightness-0 invert" v-if="selectedLeague === league.id">
          <img :src="league.logo" class="w-4 h-4 object-contain" v-else>
          {{ league.name }}
        </button>
      </div>
    </div>

    <div class="mb-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
      <img :src="leagueLogo" class="w-16 h-16 object-contain">
      <div>
        <h2 class="text-xl font-bold text-gray-800 uppercase">{{ leagueTitle }}</h2>
        <p class="text-gray-500">{{ leagueCountry }} • {{ season }}-{{ String((season + 1) % 100).padStart(2, '0') }}</p>
      </div>
    </div>

    <div v-if="pending" class="rounded-xl border border-gray-200 bg-white p-6 text-gray-500">
      กำลังโหลดตารางคะแนน...
    </div>

    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
      โหลดตารางคะแนนไม่สำเร็จ: {{ (error as any)?.statusMessage || (error as any)?.message }}
      <button class="ml-3 underline" @click="refresh()">ลองใหม่</button>
    </div>

    <div v-else-if="!standings.length" class="rounded-xl border border-gray-200 bg-white p-6 text-gray-500">
      ไม่พบข้อมูลตารางคะแนนของลีกนี้
    </div>

    <StandingsTableVue v-else :standings="standings" />

  </div>
</template>
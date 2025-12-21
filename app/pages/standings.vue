<script setup lang="ts">
import { ref, computed } from 'vue';
import StandingsTableVue from '~/components/Standings/StandingsTable.vue';

// 1. State
const selectedLeague = ref('epl');

// 2. Mock Data: Leagues
const leagues = [
  { id: 'epl', name: 'Premier League', country: 'England', logo: 'https://media.api-sports.io/football/leagues/39.png' },
  { id: 'laliga', name: 'La Liga', country: 'Spain', logo: 'https://media.api-sports.io/football/leagues/140.png' },
  { id: 'bundes', name: 'Bundesliga', country: 'Germany', logo: 'https://media.api-sports.io/football/leagues/78.png' },
  { id: 'seriea', name: 'Serie A', country: 'Italy', logo: 'https://media.api-sports.io/football/leagues/135.png' },
  { id: 'ligue1', name: 'Ligue 1', country: 'France', logo: 'https://media.api-sports.io/football/leagues/61.png' },
];

// Computed: หาข้อมูลลีกที่เลือกอยู่
const currentLeague = computed(() => leagues.find(l => l.id === selectedLeague.value));

// 3. Mock Data: Standings (ข้อมูลตารางคะแนน)
const mockStandings = [
  { rank: 1, name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png', played: 17, win: 13, draw: 3, lose: 1, goalsFor: 40, goalsAgainst: 17, goalsDiff: 23, points: 42, form: ['W','W','D','W','W'] },
  { rank: 2, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png', played: 17, win: 10, draw: 5, lose: 2, goalsFor: 35, goalsAgainst: 16, goalsDiff: 19, points: 35, form: ['W','D','W','W','D'] },
  { rank: 3, name: 'Nottm Forest', logo: 'https://media.api-sports.io/football/teams/65.png', played: 17, win: 10, draw: 4, lose: 3, goalsFor: 26, goalsAgainst: 17, goalsDiff: 9, points: 34, form: ['W','L','W','W','D'] },
  { rank: 4, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png', played: 17, win: 9, draw: 5, lose: 3, goalsFor: 36, goalsAgainst: 22, goalsDiff: 14, points: 32, form: ['D','W','W','L','W'] },
  { rank: 5, name: 'Newcastle', logo: 'https://media.api-sports.io/football/teams/34.png', played: 17, win: 9, draw: 4, lose: 4, goalsFor: 30, goalsAgainst: 18, goalsDiff: 12, points: 31, form: ['W','W','D','L','W'] },
  // ... เพิ่มทีมอื่นๆ ต่อได้เลย
];
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
      <p class="text-sm text-gray-500 mt-1 ml-12">อัปเดตล่าสุด: ฤดูกาล 2024-25</p>
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
      <img :src="currentLeague?.logo" class="w-16 h-16 object-contain">
      <div>
        <h2 class="text-xl font-bold text-gray-800 uppercase">{{ currentLeague?.name }}</h2>
        <p class="text-gray-500">{{ currentLeague?.country }} • 2024-25</p>
      </div>
    </div>

    <StandingsTableVue :standings="mockStandings" />

  </div>
</template>
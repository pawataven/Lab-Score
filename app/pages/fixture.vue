<script setup lang="ts">
import { ref, computed } from 'vue';

import HomeFixturesListVue from '~/components/home/HomeFixturesList.vue';
import HomeMenuSidebarVue from '~/components/home/HomeMenuSidebar.vue';
import DateNavigatorVue from '~/components/ui/DateNavigator.vue';

// State
const selectedDate = ref('all');
const selectedLeagues = ref(['epl', 'laliga', 'seriea', 'bundes', 'thaileague', 'ligue1']);

// Computed: ชื่อวันที่หัวข้อ (Header)
const displayDateHeader = computed(() => {
  if (selectedDate.value === 'all') return 'โปรแกรมการแข่งขันทั้งหมด';
  // แปลงวันที่ YYYY-MM-DD เป็นไทย
  const date = new Date(selectedDate.value);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('th-TH', options);
});

// Computed: นับรวมแมตช์ทั้งหมด
const totalMatches = computed(() => {
  return mockUpcomingFixtures.reduce((acc, league) => acc + league.matches.length, 0);
});

// 🛠 MOCK DATA: รายชื่อลีกใน Sidebar
const mockLeagues = [
  { id: 'epl', name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
  { id: 'laliga', name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png' },
  { id: 'seriea', name: 'Serie A', logo: 'https://media.api-sports.io/football/leagues/135.png' },
  { id: 'bundes', name: 'Bundesliga', logo: 'https://media.api-sports.io/football/leagues/78.png' },
  { id: 'thaileague', name: 'Thai League 1', logo: 'https://media.api-sports.io/football/leagues/292.png' },
  { id: 'ligue1', name: 'Ligue 1', logo: 'https://media.api-sports.io/football/leagues/61.png' },
];

// 🛠 MOCK DATA: โปรแกรมบอล (Upcoming)
const mockUpcomingFixtures = [
  {
    id: 1,
    name: 'Premier League',
    country: 'England',
    season: '2024/25',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    liveCount: 0,
    matches: [
      {
        id: 101,
        timeDisplay: "19:30",
        status: "UPCOMING",
        statusText: "Upcoming",
        home: { name: "Arsenal", score: 0, logo: "https://media.api-sports.io/football/teams/42.png" },
        away: { name: "Man United", score: 0, logo: "https://media.api-sports.io/football/teams/33.png" }
      },
      {
        id: 102,
        timeDisplay: "22:00",
        status: "UPCOMING",
        statusText: "Upcoming",
        home: { name: "Chelsea", score: 0, logo: "https://media.api-sports.io/football/teams/49.png" },
        away: { name: "Liverpool", score: 0, logo: "https://media.api-sports.io/football/teams/40.png" }
      }
    ]
  },
  {
    id: 2,
    name: 'La Liga',
    country: 'Spain',
    season: '2024/25',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    liveCount: 0,
    matches: [
      {
        id: 201,
        timeDisplay: "02:00",
        status: "UPCOMING",
        statusText: "Upcoming",
        home: { name: "Barcelona", score: 0, logo: "https://media.api-sports.io/football/teams/529.png" },
        away: { name: "Sevilla", score: 0, logo: "https://media.api-sports.io/football/teams/536.png" }
      },
       {
        id: 202,
        timeDisplay: "04:00",
        status: "UPCOMING",
        statusText: "Upcoming",
        home: { name: "Valencia", score: 0, logo: "https://media.api-sports.io/football/teams/532.png" },
        away: { name: "Villarreal", score: 0, logo: "https://media.api-sports.io/football/teams/533.png" }
      }
    ]
  }
];
</script>

<template>
  <div class="mx-auto max-w-7xl p-4 md:p-6 min-h-screen">
    
    <div class="mb-6 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-orange-100 rounded-xl text-[#f97316]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">โปรแกรมการแข่งขัน</h1>
          <p class="text-sm text-gray-500">38 แมตช์ใน 7 วันข้างหน้า</p>
        </div>
      </div>
    </div>

    <div class="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-md w-fit">
      <DateNavigatorVue v-model="selectedDate" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
      
      <aside class="hidden lg:block sticky top-24">
        <HomeMenuSidebarVue 
          :leagues="mockLeagues"
          v-model="selectedLeagues" 
        />
      </aside>

      <main class="w-full space-y-6">
        
        <div class="w-full h-32 bg-gray-100 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
          <span class="text-xs font-semibold tracking-wider uppercase">Advertisement</span>
        </div>

        <div class="flex items-center gap-3 mb-2">
          <div class="p-2 bg-orange-50 rounded-lg text-[#f97316]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="text-lg font-bold text-gray-800">
            {{ displayDateHeader }}
          </h2>
          <span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
            {{ totalMatches }} แมตช์
          </span>
        </div>

        <HomeFixturesListVue :fixtures="mockUpcomingFixtures" />

        <div v-if="mockUpcomingFixtures.length === 0" class="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
          <p class="text-gray-500">ไม่มีโปรแกรมการแข่งขันในวันที่เลือก</p>
        </div>

      </main>
    </div>

  </div>
</template>
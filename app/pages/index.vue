<script setup lang="ts">
import HomeLiveMatchBarVue from '~/components/home/HomeLiveMatchBar.vue';
import HomeMenuSidebarVue from '~/components/home/HomeMenuSidebar.vue';
import HomeSubNavbarVue from '~/components/home/HomeSubNavbar.vue';
import HomeFixturesListVue from '~/components/home/HomeFixturesList.vue';

import { ref } from 'vue';
import DateNavigatorVue from '~/components/ui/DateNavigator.vue';

const date = ref('2025-11-12');
const selectedLeagues = ref(['epl', 'laliga', 'seriea', 'bundes', 'thaileague']); // Default checked

const mockLeagues = [
  { id: 'epl', name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
  { id: 'laliga', name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png' },
  { id: 'seriea', name: 'Serie A', logo: 'https://media.api-sports.io/football/leagues/135.png' },
  { id: 'bundes', name: 'Bundesliga', logo: 'https://media.api-sports.io/football/leagues/78.png' },
  { id: 'thaileague', name: 'Thai League 1', logo: 'https://media.api-sports.io/football/leagues/292.png' },
  { id: 'ligue1', name: 'Ligue 1', logo: 'https://media.api-sports.io/football/leagues/61.png' },
];

const mockFixturesData = [
  {
    id: 1,
    name: 'พรีเมียร์ลีก อังกฤษ',
    country: 'England',
    season: '2024/25',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    liveCount: 1,
    matches: [
      {
        id: 101,
        timeDisplay: "75'",
        status: "LIVE",
        statusText: "Live", // หรือจะใส่ 75' ตรงนี้ก็ได้
        home: { name: "ลิเวอร์พูล", score: 2, logo: "https://media.api-sports.io/football/teams/40.png" },
        away: { name: "เเมนซิตี้", score: 1, logo: "https://media.api-sports.io/football/teams/50.png" }
      },
      {
        id: 102,
        timeDisplay: "FT",
        status: "FT",
        statusText: "FT",
        home: { name: "แมนยู", score: 1, logo: "https://media.api-sports.io/football/teams/33.png" },
        away: { name: "สเปอร์ส", score: 1, logo: "https://media.api-sports.io/football/teams/47.png" }
      }
    ]
  },
  {
    id: 2,
    name: 'ลาลีก้า สเปน',
    country: 'Spain',
    season: '2024/25',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    liveCount: 0,
    matches: [
      {
        id: 201,
        timeDisplay: "22:00",
        status: "UPCOMING",
        statusText: "Upcoming",
        home: { name: "เรอัล มาดริด", score: 0, logo: "https://media.api-sports.io/football/teams/541.png" },
        away: { name: "บาร์เซโลน่าา", score: 0, logo: "https://media.api-sports.io/football/teams/529.png" }
      }
    ]
  }
];

</script>

<template>
  <HomeSubNavbarVue class="flex-initial" />

  <div class="mx-auto mt-6 max-w-full px-4 sm:px-6 lg:px-50">
    <HomeLiveMatchBarVue :match-count="5" class="mt-4" />
  </div>

  <div class="mx-auto max-w-7xl p-4 md:p-6">

    <!-- <DateNavigatorVue v-model="date" class="mb-6" /> -->

    <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">

      <aside class="hidden lg:block sticky top-20">
        <HomeMenuSidebarVue :leagues="mockLeagues" v-model="selectedLeagues" />
      </aside>

      <main class="w-full space-y-4">

        <HomeFixturesListVue :fixtures="mockFixturesData" />

      </main>

    </div>
  </div>
</template>
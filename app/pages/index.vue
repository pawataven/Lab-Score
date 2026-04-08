<script setup lang="ts">
import type { StatusFilter } from '~/types/fixture'

// Components
import HomeLiveMatchBarVue from '~/components/home/HomeLiveMatchBar.vue'
import HomeMenuSidebarVue from '~/components/home/HomeMenuSidebar.vue'
import HomeSubNavbarVue from '~/components/home/HomeSubNavbar.vue'
import HomeFixturesListVue from '~/components/home/HomeFixturesList.vue'
import HomeLoadingSkeleton from '~/components/home/HomeLoadingSkeleton.vue'
import HomeEmptyState from '~/components/home/HomeEmptyState.vue'

// Composables
const { leaguesUI, selectedLeagues, selectedLeagueIds, resetLeagues } = useLeagueConfig()
const {
  date,
  statusFilter,
  fixturesData,
  pending,
  error,
  planMessage,
  liveMatchCount,
  totalMatchCount,
  retry,
} = useFixtures(selectedLeagueIds)
</script>

<template>
  <HomeSubNavbarVue v-model="date" :filter="statusFilter" @update:filter="statusFilter = $event as StatusFilter" />

  <div class="mx-auto mt-6 max-w-full px-4 sm:px-6 lg:px-50">
    <HomeLiveMatchBarVue :match-count="pending ? 0 : liveMatchCount" :TotalmatchCount="pending ? 0 : totalMatchCount"
      class="mt-4" />
  </div>

  <div class="mx-auto max-w-7xl p-4 md:p-6">
    <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
      <aside class="hidden lg:block sticky top-30">
        <HomeMenuSidebarVue :leagues="leaguesUI as any" v-model="selectedLeagues" @reset="resetLeagues()" />
      </aside>

      <main class="w-full space-y-4">
        <div v-if="planMessage" class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 mb-4">
          {{ planMessage }}
        </div>

        <ClientOnly>
          <div v-if="pending" class="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div class="absolute top-0 left-0 right-0 h-1 bg-slate-100 z-10">
              <div class="h-full bg-green-500 shimmer-bar"></div>
            </div>
            <div class="p-4 space-y-5 opacity-70 pointer-events-none">
              <div class="flex items-center gap-4 mb-4">
                <div class="h-10 w-10 rounded-full bg-slate-200 animate-pulse"></div>
                <div class="flex flex-col gap-2">
                  <div class="h-5 w-32 rounded bg-slate-200 animate-pulse"></div>
                  <div class="h-3 w-20 rounded bg-slate-100 animate-pulse"></div>
                </div>
              </div>
              <div v-for="i in 3" :key="i" class="flex items-center justify-between py-3 border-b border-slate-50">
                <div class="h-4 w-full rounded bg-slate-100 animate-pulse"></div>
              </div>
              <div class="text-center text-xs text-slate-400 pt-2">กำลังดึงข้อมูลล่าสุด...</div>
            </div>
          </div>

          <div v-else-if="error" class="rounded-xl border p-4 text-red-600">
            โหลดไม่สำเร็จ: {{ (error as any)?.statusMessage || (error as any)?.message }}
            <button class="ml-3 underline" @click="retry">ลองใหม่</button>
          </div>

          <div v-else-if="!fixturesData.length"
            class="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-12 text-center">

            <div v-if="statusFilter === 'live'" class="space-y-3">
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                  <polyline points="17 2 12 7 7 2"></polyline>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">ไม่มีการแข่งขันสดในขณะนี้</h3>
              <button @click="statusFilter = 'all';"
                class="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-slate-50 border border-slate-300">
                ดูโปรแกรมทั้งหมด
              </button>
            </div>

            <div v-else-if="statusFilter === 'upcoming'" class="space-y-3">
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">ไม่มีโปรแกรมที่รอแข่งขัน</h3>
              <button @click="statusFilter = 'finished';"
                class="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-slate-50 border border-slate-300">
                ดูโปรแกรมที่จบเเล้ว
              </button>
            </div>

            <div v-else-if="statusFilter === 'finished'" class="space-y-3">
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 20c0 1.1.9 2 2 2s2-.9 2-2V10H4v6c0 1.1.9 2 2 2h4z" />
                  <path d="M14 10V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">ยังไม่มีคู่ที่แข่งจบ</h3>
              <button @click="statusFilter = 'all';"
                class="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-slate-50 border border-slate-300">
                ดูโปรแกรมทั้งหมด
              </button>
            </div>

            <div v-else class="space-y-3">
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-900">ไม่พบตารางการแข่งขัน</h2>
              <p class="text-gray-700 px-4">ไม่มีแมตช์ในวันที่เลือก หรืออยู่นอกเหนือระยะเวลาที่ระบบบันทึกข้อมูล</p>
              <div class="flex gap-3 justify-center">
                <button @click="retry"
                  class="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-slate-50 border border-slate-300">
                  รีเฟรชข้อมูล
                </button>
              </div>
            </div>
          </div>

          <HomeFixturesListVue v-else :fixtures="fixturesData" />

          <template #fallback>
            <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div class="absolute top-0 left-0 right-0 h-1 bg-slate-100 z-10">
                <div class="h-full bg-green-500 shimmer-bar"></div>
              </div>
              <div class="p-4 space-y-5 opacity-70 pointer-events-none">
                <div class="flex items-center gap-4 mb-4">
                  <div class="h-10 w-10 rounded-full bg-slate-200 animate-pulse"></div>
                  <div class="flex flex-col gap-2">
                    <div class="h-5 w-32 rounded bg-slate-200 animate-pulse"></div>
                    <div class="h-3 w-20 rounded bg-slate-100 animate-pulse"></div>
                  </div>
                </div>
                <div v-for="i in 3" :key="i" class="flex items-center justify-between py-3 border-b border-slate-50">
                  <div class="h-4 w-full rounded bg-slate-100 animate-pulse"></div>
                </div>
                <div class="text-center text-xs text-slate-400 pt-2">กำลังเตรียมข้อมูล...</div>
              </div>
            </div>
          </template>

        </ClientOnly>
      </main>
    </div>
  </div>
</template>

<style scoped>
.shimmer-bar {
  width: 100%;
  animation: indeterminate 1.5s infinite linear;
  transform-origin: 0% 50%;
}

@keyframes indeterminate {
  0% {
    transform: translateX(0) scaleX(0);
  }

  40% {
    transform: translateX(0) scaleX(0.4);
  }

  100% {
    transform: translateX(100%) scaleX(0.5);
  }
}
</style>

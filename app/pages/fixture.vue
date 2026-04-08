<script setup lang="ts">
import type { FixtureApiResponse, LeagueGroup } from '~/types/fixture'
import { buildLeagueGroups } from '~/utils/fixtures'
import { BUSINESS_TIME_ZONE, getBusinessDateString, getMillisecondsUntilNextBusinessDay } from '~/utils/date'

import HomeFixturesListVue from '~/components/home/HomeFixturesList.vue'
import HomeMenuSidebarVue from '~/components/home/HomeMenuSidebar.vue'
import DateNavigatorVue from '~/components/ui/DateNavigator.vue'

const { leaguesUI, selectedLeagues, selectedLeagueIds } = useLeagueConfig()

const selectedDate = ref<string>('all')

const leagueIdsForQuery = computed(() => {
  const ids = selectedLeagueIds.value
  return ids.length ? [...ids].sort((a, b) => a - b) : [...selectedLeagueIds.value].sort((a, b) => a - b)
})

const resolvedApiDate = computed(() =>
  selectedDate.value === 'all' ? getBusinessDateString() : selectedDate.value,
)

const fetchQuery = computed(() => ({
  date: resolvedApiDate.value,
  leagues: leagueIdsForQuery.value.join(','),
  timezone: BUSINESS_TIME_ZONE,
}))

const { data, pending, error, refresh } = await useAsyncData<FixtureApiResponse>(
  'fixture-program-schedule',
  () =>
    $fetch<FixtureApiResponse>('/api/fixtures', {
      query: fetchQuery.value,
    }),
  {
    lazy: false,
    watch: [fetchQuery],
  },
)

const planMessage = computed(() => {
  const msg = Array.isArray(data.value?.errors) ? '' : data.value?.errors?.plan
  if (typeof msg === 'string' && (msg.includes('Free') || msg.includes('access'))) {
    return 'ขออภัยไม่สามารถเรียกดูข้อมูลย้อนหลังหรือล่วงหน้าเกิน 3 วันได้ในขณะนี้'
  }
  return typeof msg === 'string' ? msg : ''
})

const fixtures = computed<LeagueGroup[]>(() => {
  return buildLeagueGroups({
    fixtures: data.value?.response,
    leagueIds: selectedLeagueIds.value,
    pageDate: resolvedApiDate.value,
  })
})

const totalMatches = computed(() =>
  fixtures.value.reduce((acc, league) => acc + league.matches.length, 0),
)

function parseIsoDateLocal(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

const displayDateHeader = computed(() => {
  if (selectedDate.value === 'all') return 'โปรแกรมการแข่งขันทั้งหมด'
  const date = parseIsoDateLocal(selectedDate.value)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
  return date.toLocaleDateString('th-TH', options)
})

const subtitleLine = computed(() => {
  if (pending.value) return 'กำลังโหลดโปรแกรม...'
  if (totalMatches.value === 0) return 'ไม่มีแมตช์ในวันที่เลือก'
  return `${totalMatches.value} แมตช์`
})

function retryLoad() {
  void refresh()
}

if (import.meta.client) {
  let rolloverTimer: ReturnType<typeof setTimeout> | undefined

  const scheduleRollover = () => {
    clearTimeout(rolloverTimer)
    rolloverTimer = setTimeout(() => {
      if (selectedDate.value === 'all') {
        void refresh()
      }
      scheduleRollover()
    }, getMillisecondsUntilNextBusinessDay())
  }

  onMounted(() => {
    scheduleRollover()
  })

  onBeforeUnmount(() => {
    clearTimeout(rolloverTimer)
  })
}
</script>

<template>
  <div class="mx-auto max-w-7xl min-h-screen p-4 md:p-6">
    <div class="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <div class="flex items-center gap-3">
        <div class="rounded-xl bg-orange-100 p-2.5 text-[#f97316]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">
            โปรแกรมการแข่งขัน
          </h1>
          <p class="text-sm text-gray-500">
            {{ subtitleLine }}
          </p>
        </div>
      </div>
    </div>

    <div class="mb-6 w-fit rounded-2xl border border-gray-100 bg-white p-4 shadow-md">
      <DateNavigatorVue v-model="selectedDate" />
    </div>

    <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-[280px_1fr]">
      <aside class="sticky top-24 hidden lg:block">
        <HomeMenuSidebarVue
          :leagues="leaguesUI"
          v-model="selectedLeagues"
        />
      </aside>

      <main class="w-full space-y-6">
        <div class="flex h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-100 text-gray-400">
          <span class="text-xs font-semibold uppercase tracking-wider">Advertisement</span>
        </div>

        <div v-if="planMessage" class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          {{ planMessage }}
        </div>

        <div class="mb-2 flex items-center gap-3">
          <div class="rounded-lg bg-orange-50 p-2 text-[#f97316]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="text-lg font-bold text-gray-800">
            {{ displayDateHeader }}
          </h2>
          <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            {{ pending ? '…' : totalMatches }} แมตช์
          </span>
        </div>

        <div
          v-if="pending"
          class="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div class="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-orange-400 via-orange-500 to-orange-400 animate-pulse" />
          <p class="text-center text-sm font-medium text-slate-600">
            กำลังโหลดโปรแกรม...
          </p>
        </div>

        <div
          v-else-if="error"
          class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800"
        >
          <p class="font-medium">
            โหลดข้อมูลไม่สำเร็จ
          </p>
          <p class="mt-1 text-sm opacity-90">
            {{ (error as any)?.statusMessage || (error as any)?.message || 'ลองใหม่อีกครั้ง' }}
          </p>
          <button
            type="button"
            class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            @click="retryLoad"
          >
            ลองอีกครั้ง
          </button>
        </div>

        <template v-else>
          <HomeFixturesListVue :fixtures="fixtures" />

          <div
            v-if="fixtures.length === 0"
            class="rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center"
          >
            <p class="text-gray-500">
              ไม่มีโปรแกรมการแข่งขันในวันที่เลือก
            </p>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

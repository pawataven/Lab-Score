<script setup lang="ts">
import { computed, ref, watch, watchEffect, onMounted } from "vue"

// Import Components
import HomeLiveMatchBarVue from "~/components/home/HomeLiveMatchBar.vue"
import HomeMenuSidebarVue from "~/components/home/HomeMenuSidebar.vue"
import HomeSubNavbarVue from "~/components/home/HomeSubNavbar.vue"
import HomeFixturesListVue from "~/components/home/HomeFixturesList.vue"

// ----------------------
// Utils (Helper Functions)
// ----------------------
function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function formatHHmm(iso: string) {
  const d = new Date(iso)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function fmtDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

// ✅ [FIXED] ฟังก์ชันหาวันปัจจุบันแบบระบุ Timezone (แก้ Hydration Mismatch)
function getBangkokCurrentDate() {
  // ใช้ Intl เพื่อบังคับเป็น Asia/Bangkok เสมอ ทั้งบน Server และ Client
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  // en-CA format จะได้เป็น YYYY-MM-DD อยู่แล้ว (มาตรฐาน ISO)
  return formatter.format(new Date())
}

// ----------------------
// UI state
// ----------------------
const route = useRoute()
const router = useRouter()

// [BEST PRACTICE] ใช้ computed ผูกกับ URL โดยตรง (Single Source of Truth)
// ถ้า URL ไม่มี date ให้ใช้ "วันนี้ (เวลาไทย)" เป็นค่าเริ่มต้น
const date = computed({
  get: () => (route.query.date as string) || getBangkokCurrentDate(),
  set: (newDate) => {
    if (newDate !== route.query.date) {
      router.replace({ query: { ...route.query, date: newDate } })
    }
  }
})

// --- League Configuration ---
const leaguesUI = [
  { id: "epl", name: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png" },
  { id: "laliga", name: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png" },
  { id: "seriea", name: "Serie A", logo: "https://media.api-sports.io/football/leagues/135.png" },
  { id: "bundes", name: "Bundesliga", logo: "https://media.api-sports.io/football/leagues/78.png" },
  { id: "thaileague", name: "Thai League 1", logo: "https://media.api-sports.io/football/leagues/292.png" },
  { id: "ligue1", name: "Ligue 1", logo: "https://media.api-sports.io/football/leagues/61.png" },
] as const

const DEFAULT_SELECTED_LEAGUES = [
  "epl", "laliga", "seriea", "bundes", "thaileague", "ligue1",
] as const

const selectedLeagues = ref<string[]>([...DEFAULT_SELECTED_LEAGUES])

const LEAGUE_MAP = {
  epl: 39, laliga: 140, seriea: 135, bundes: 78, thaileague: 292, ligue1: 61,
} as const

type LeagueSlug = keyof typeof LEAGUE_MAP
type LeagueId = typeof LEAGUE_MAP[LeagueSlug]

function resetLeagues() {
  selectedLeagues.value = [...DEFAULT_SELECTED_LEAGUES]
}

const selectedLeagueIds = computed(() =>
  selectedLeagues.value
    .map((s) => LEAGUE_MAP[s as LeagueSlug])
    .filter((n): n is LeagueId => typeof n === "number")
)

// ----------------------
// Fetch Fixtures (Logic เดิมที่ถูกต้องแล้ว)
// ----------------------
type FixturesApiResponse = {
  errors?: Record<string, any>
  response?: any[]
  [k: string]: any
}

const nonce = ref(0) // สำหรับปุ่ม refresh

// 1. สร้าง Query ดิบ
const rawFetchQuery = computed(() => ({
  date: date.value,
  leagues: selectedLeagueIds.value.join(","),
  timezone: "UTC", // ใช้ UTC เพื่อให้ Server จัดการง่าย แล้วเรามาแปลงเวลาเอาเองหน้าบ้าน
}))

// 2. Debounce
const debouncedFetchQuery = ref(rawFetchQuery.value)
let debounceTimer: NodeJS.Timeout

watch(rawFetchQuery, (newVal) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedFetchQuery.value = newVal
  }, 500)
})

// สร้าง Key
const fetchKey = computed(() => {
  const q = debouncedFetchQuery.value
  return `fixtures:${q.date}:${q.leagues}:UTC:${nonce.value}`
})

// 3. ยิง API
// หมายเหตุ: การใช้ server: false จะทำให้ SEO ด้อยลงนิดหน่อย แต่ประหยัดโควต้า API ได้ดี
// และช่วยลดปัญหา Hydration Mismatch ได้ทางอ้อม (เพราะ Server ไม่ render ข้อมูลมาชนกับ Client)
const { data, pending, error, refresh } = await useFetch<FixturesApiResponse>("/api/fixtures", {
  query: debouncedFetchQuery,
  key: fetchKey,
  watch: [debouncedFetchQuery],
  dedupe: "cancel",
  server: false, // ✅ คงไว้ตามที่คุณต้องการ (Client-side fetch only)
})

// ----------------------
// Free-plan date auto-adjust
// ----------------------
const planMessage = computed(() => {
  const msg = data.value?.errors?.plan
  if (typeof msg === "string") {
    if (msg.includes("Free") || msg.includes("access")) {
      return "ขออภัยไม่สามารถเรียกดูข้อมูลย้อนหลังหรือล่วงหน้าเกิน 3 วันได้ในขณะนี้"
    }
    return msg
  }
  return ""
})

function parsePlanRange(msg: string): { from: string; to: string } | null {
  const m = msg.match(/try from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/i)
  if (!m || !m[1] || !m[2]) return null
  return { from: m[1], to: m[2] }
}

function midDate(from: string, to: string) {
  const a = new Date(from + "T00:00:00")
  const b = new Date(to + "T00:00:00")
  const mid = new Date(Math.floor((a.getTime() + b.getTime()) / 2))
  return fmtDate(mid)
}

const adjusting = ref(false)

watchEffect(() => {
  if (adjusting.value) return
  if (!planMessage.value) return

  const range = parsePlanRange(planMessage.value)
  if (!range) return

  const next = midDate(range.from, range.to)
  if (date.value !== next) {
    adjusting.value = true
    date.value = next
    setTimeout(() => (adjusting.value = false), 400)
  }
})

// ----------------------
// Transform Data
// ----------------------
function toMatchModel(fx: any) {
  const short = fx?.fixture?.status?.short ?? ""
  const elapsed = fx?.fixture?.status?.elapsed

  // Format Time: เนื่องจากเราดึงแบบ UTC มา
  // Browser จะใช้ new Date(iso) แปลงเป็น Local Time ของเครื่อง user ให้อัตโนมัติ ✅
  const timeDisplay =
    short === "NS"
      ? formatHHmm(fx?.fixture?.date)
      : typeof elapsed === "number"
        ? `${elapsed}'`
        : short || "-"

  const status =
    short === "NS"
      ? "UPCOMING"
      : short === "FT" || short === "AET" || short === "PEN"
        ? "FT"
        : "LIVE"

  return {
    id: fx?.fixture?.id,
    timeDisplay,
    status,
    statusText: short,
    home: {
      name: fx?.teams?.home?.name ?? "-",
      score: fx?.goals?.home ?? 0,
      logo: fx?.teams?.home?.logo ?? "",
    },
    away: {
      name: fx?.teams?.away?.name ?? "-",
      score: fx?.goals?.away ?? 0,
      logo: fx?.teams?.away?.logo ?? "",
    },
  }
}

const statusFilter = ref('all')

const fixturesData = computed(() => {
  const arr = Array.isArray(data.value?.response) ? data.value!.response! : []

  const groups = new Map<number, any[]>()
  for (const fx of arr) {
    const lid = fx?.league?.id
    if (!selectedLeagueIds.value.includes(lid)) continue
    if (typeof lid !== "number") continue
    if (!groups.has(lid)) groups.set(lid, [])
    groups.get(lid)!.push(fx)
  }

  const result = Array.from(groups.entries()).map(([leagueId, items]) => {
    const first = items[0]
    let matches = items.map(toMatchModel)

    if (statusFilter.value !== 'all') {
      matches = matches.filter(m => {
        if (statusFilter.value === 'live') return m.status === 'LIVE'
        if (statusFilter.value === 'upcoming') return m.status === 'UPCOMING'
        if (statusFilter.value === 'finished') return m.status === 'FT'
        return true
      })
    }
    const liveCount = matches.filter((m) => m.status === "LIVE").length

    return {
      id: leagueId,
      name: first?.league?.name ?? "Unknown League",
      country: first?.league?.country ?? "",
      season: first?.league?.season ? String(first.league.season) : "-",
      logo: first?.league?.logo ?? "",
      liveCount,
      matches,
    }
  })

  const finalResult = result.filter(league => league.matches.length > 0)
  finalResult.sort((a, b) => (b.liveCount - a.liveCount) || (b.matches.length - a.matches.length))

  return finalResult
})

const liveMatchCount = computed(() =>
  fixturesData.value.reduce((sum: number, g: any) => sum + (g?.liveCount ?? 0), 0)
)

const totalMatchCount = computed(() =>
  fixturesData.value.reduce((sum: number, league: any) => sum + (league?.matches?.length ?? 0), 0)
)
</script>

<template>
  <HomeSubNavbarVue v-model="date" :filter="statusFilter" @update:filter="statusFilter = $event" />

  <div class="mx-auto mt-6 max-w-full px-4 sm:px-6 lg:px-50">
    <HomeLiveMatchBarVue :match-count="liveMatchCount" :TotalmatchCount="totalMatchCount" class="mt-4" />
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
              <div v-for="i in 3" :key="i"
                class="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div class="flex items-center gap-4 w-full">
                  <div class="h-4 w-10 rounded bg-slate-100 animate-pulse"></div>
                  <div class="flex-1 flex justify-between items-center px-4 gap-4">
                    <div class="h-4 w-1/3 rounded bg-slate-100 animate-pulse"></div>
                    <div class="h-6 w-8 rounded bg-slate-200 animate-pulse"></div>
                    <div class="h-4 w-1/3 rounded bg-slate-100 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div class="text-center text-xs text-slate-400 pt-2">กำลังดึงข้อมูลล่าสุด...</div>
            </div>
          </div>

          <div v-else-if="error" class="rounded-xl border p-4 text-red-600">
            โหลดไม่สำเร็จ: {{ (error as any)?.statusMessage || (error as any)?.message }}
            <button class="ml-3 underline" @click="nonce++; refresh()">ลองใหม่</button>
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
              <h3 class="text-lg font-semibold text-slate-700">ไม่มีการแข่งขันสดในขณะนี้</h3>
              <button @click="statusFilter = 'all';"
                class="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 border border-slate-300">ดูโปรแกรมทั้งหมด</button>
            </div>

            <div v-else-if="statusFilter === 'upcoming'" class="space-y-3">
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-700">ไม่มีโปรแกรมที่รอแข่งขัน</h3>
              <button @click="statusFilter = 'finished';"
                class="mt-2 text-blue-600 hover:underline">ดูผลบอลที่จบแล้ว</button>
            </div>

            <div v-else-if="statusFilter === 'finished'" class="space-y-3">
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 20c0 1.1.9 2 2 2s2-.9 2-2V10H4v6c0 1.1.9 2 2 2h4z" />
                  <path d="M14 10V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-700">ยังไม่มีคู่ที่แข่งจบ</h3>
            </div>

            <div v-else class="space-y-3">
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-700">ไม่พบตารางการแข่งขัน</h3>
              <p class="text-slate-500">ไม่มีแมตช์ในวันที่เลือก หรืออยู่นอกเหนือระยะเวลาที่ระบบบันทึกข้อมูล</p>
              <div class="flex gap-3 justify-center">
                <button @click="nonce++; refresh()" class="text-primary hover:underline">รีเฟรชข้อมูล</button>
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
                <div v-for="i in 3" :key="i"
                  class="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div class="flex items-center gap-4 w-full">
                    <div class="h-4 w-10 rounded bg-slate-100 animate-pulse"></div>
                    <div class="flex-1 flex justify-between items-center px-4 gap-4">
                      <div class="h-4 w-1/3 rounded bg-slate-100 animate-pulse"></div>
                      <div class="h-6 w-8 rounded bg-slate-200 animate-pulse"></div>
                      <div class="h-4 w-1/3 rounded bg-slate-100 animate-pulse"></div>
                    </div>
                  </div>
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
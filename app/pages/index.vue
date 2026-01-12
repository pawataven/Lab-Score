<script setup lang="ts">
import { computed, ref, watchEffect } from "vue"

import HomeLiveMatchBarVue from "~/components/home/HomeLiveMatchBar.vue"
import HomeMenuSidebarVue from "~/components/home/HomeMenuSidebar.vue"
import HomeSubNavbarVue from "~/components/home/HomeSubNavbar.vue"
import HomeFixturesListVue from "~/components/home/HomeFixturesList.vue"

// ----------------------
// utils
// ----------------------
function fmtDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
function pad2(n: number) {
  return String(n).padStart(2, "0")
}
function formatHHmm(iso: string) {
  const d = new Date(iso)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

// ----------------------
// UI state
// ----------------------
const route = useRoute()
const router = useRouter()

// ตั้งค่าวันเริ่มต้น: ถ้า URL มี ?date=... ให้ใช้ค่าเดิม ไม่งั้นใช้วันนี้
const initialDate = (route.query.date as string) || getBangkokCurrentDate()
const date = ref(initialDate)

// Sync URL: เมื่อ date เปลี่ยน -> เปลี่ยน URL (ไม่ reload หน้า)
watch(date, (newDate) => {
  router.replace({ query: { ...route.query, date: newDate } })
})

const leaguesUI = [
  { id: "epl", name: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png" },
  { id: "laliga", name: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png" },
  { id: "seriea", name: "Serie A", logo: "https://media.api-sports.io/football/leagues/135.png" },
  { id: "bundes", name: "Bundesliga", logo: "https://media.api-sports.io/football/leagues/78.png" },
  { id: "thaileague", name: "Thai League 1", logo: "https://media.api-sports.io/football/leagues/292.png" },
  { id: "ligue1", name: "Ligue 1", logo: "https://media.api-sports.io/football/leagues/61.png" },
] as const

const DEFAULT_SELECTED_LEAGUES = [
  "epl",
  "laliga",
  "seriea",
  "bundes",
  "thaileague",
] as const

const selectedLeagues = ref<string[]>([...DEFAULT_SELECTED_LEAGUES])

const LEAGUE_MAP = {
  epl: 39,
  laliga: 140,
  seriea: 135,
  bundes: 78,
  thaileague: 292,
  ligue1: 61,
} as const

type LeagueSlug = keyof typeof LEAGUE_MAP
type LeagueId = typeof LEAGUE_MAP[LeagueSlug]

function resetLeagues() {
  selectedLeagues.value = [...DEFAULT_SELECTED_LEAGUES]
}

// type-safe + กัน slug หลุด map
const selectedLeagueIds = computed(() =>
  selectedLeagues.value
    .map((s) => LEAGUE_MAP[s as LeagueSlug])
    .filter((n): n is LeagueId => typeof n === "number")
)
// ----------------------
// fetch fixtures
// ----------------------
type FixturesApiResponse = {
  errors?: Record<string, any>
  response?: any[]
  [k: string]: any
}

// nonce สำหรับบังคับ refresh แบบไม่ใช้ cache (กดปุ่มเท่านั้น)
const nonce = ref(0)

// แก้ Fetch Query: ใช้ date.value แทนค่า Hardcode
const fetchQuery = computed(() => ({
  date: date.value,  // <--- จุดสำคัญ! เปลี่ยนตรงนี้ API ถึงจะโหลดตามวันที่เลือก
  leagues: selectedLeagueIds.value.join(","),
  timezone: "Asia/Bangkok",
}))

const fetchKey = computed(() => {
  const leagues = selectedLeagueIds.value.join(",") || "none"
  return `fixtures:${date.value}:${leagues}:Asia/Bangkok:${nonce.value}`
})

const { data, pending, error, refresh } = await useFetch<FixturesApiResponse>("/api/fixtures", {
  query: fetchQuery,
  key: fetchKey,
  watch: [fetchQuery], 
  dedupe: "cancel",
  server: false,
})

// ----------------------
// Free-plan date auto-adjust (แก้กรณี errors.plan)
// ตัวอย่าง message: "Free plans do not have access to this date, try from 2025-12-20 to 2025-12-22."
// ----------------------
const planMessage = computed(() => {
  const msg = data.value?.errors?.plan
  return typeof msg === "string" ? msg : ""
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
// transform to HomeFixturesList format
// ----------------------
function toMatchModel(fx: any) {
  const short = fx?.fixture?.status?.short ?? ""
  const elapsed = fx?.fixture?.status?.elapsed

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

const fixturesData = computed(() => {
  const arr = Array.isArray(data.value?.response) ? data.value!.response! : []

  const groups = new Map<number, any[]>()
  for (const fx of arr) {
    const lid = fx?.league?.id
    if (typeof lid !== "number") continue
    if (!groups.has(lid)) groups.set(lid, [])
    groups.get(lid)!.push(fx)
  }

  const result = Array.from(groups.entries()).map(([leagueId, items]) => {
    const first = items[0]
    const matches = items.map(toMatchModel)
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

  result.sort((a, b) => (b.liveCount - a.liveCount) || (b.matches.length - a.matches.length))
  return result
})

const liveMatchCount = computed(() =>
  fixturesData.value.reduce((sum: number, g: any) => sum + (g?.liveCount ?? 0), 0)
)

const totalMatchCount = computed(() =>
  fixturesData.value.reduce((sum: number, league: any) => sum + (league?.matches?.length ?? 0), 0)
)
</script>

<template>
  <HomeSubNavbarVue v-model="date" class="flex-initial" />

  <div class="mx-auto mt-6 max-w-full px-4 sm:px-6 lg:px-50">
    <HomeLiveMatchBarVue :match-count="liveMatchCount" :TotalmatchCount="totalMatchCount" class="mt-4" />
  </div>

  <div class="mx-auto max-w-7xl p-4 md:p-6">
    <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
      <aside class="hidden lg:block sticky top-20">
        <HomeMenuSidebarVue :leagues="leaguesUI as any" v-model="selectedLeagues" @reset="resetLeagues()" />

      </aside>

      <main class="w-full space-y-4">
        <div v-if="planMessage" class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          {{ planMessage }}
        </div>

        <div v-if="pending" class="rounded-xl border p-4">
          กำลังโหลดข้อมูล...
        </div>

        <div v-else-if="error" class="rounded-xl border p-4 text-red-600">
          โหลดไม่สำเร็จ: {{ (error as any)?.statusMessage || (error as any)?.message }}
          <button class="ml-3 underline" @click="nonce++; refresh()">ลองใหม่</button>
        </div>

        <div v-else-if="!fixturesData.length" class="rounded-xl border p-4">
          ไม่พบแมตช์ในวันที่เลือก (หรือโดนจำกัดแพ็กเกจ) — ลองเปลี่ยนลีก/วัน
          <button class="ml-3 underline" @click="nonce++; refresh()">รีเฟรช</button>
        </div>

        <HomeFixturesListVue v-else :fixtures="fixturesData" />
      </main>
    </div>
  </div>
</template>
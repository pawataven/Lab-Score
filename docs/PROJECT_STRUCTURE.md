# Lab-Score — เอกสารโครงสร้างโปรเจกต์ (Production-Ready)

เอกสารนี้อธิบายสถาปัตยกรรม โฟลเดอร์ แนวทางเขียนโค้ด และจุดเชื่อมต่อของข้อมูลในโปรเจกต์ **Lab-Score** (เว็บผลบอล / โปรแกรมแข่ง / ตารางคะแนน) บน **Nuxt 4** เพื่อให้เครื่องมือ AI หรือนักพัฒนาใหม่เข้าใจบริบทได้เร็วและแก้โค้ดได้สอดคล้องกับโค้ดเดิม

---

## 1. ภาพรวมผลิตภัณฑ์

| หัวข้อ | รายละเอียด |
|--------|------------|
| **ชื่อเว็บ** | ScoreSanan - สกอร์สนั่น |
| **โดเมน** | ฟุตบอล — แสดงโปรแกรมแข่ง ผลสด ตารางคะแนน จาก API-Football |
| **ภาษา UI หลัก** | ไทย (`html lang="th"`, ฟอนต์ Prompt + subset ไทย) |
| **เวลา** | การคำนวณ "วันนี้" อิง **เวลาไทย (UTC+7)** พร้อม logic ตัดรอบตี 05:00 น. |
| **SEO** | ใช้ `@nuxtjs/seo` พร้อม Open Graph, Twitter Card |

---

## 2. Stack เทคโนโลยี (Production)

| เทคโนโลยี | เวอร์ชัน | บทบาทในโปรเจกต์ |
|-----------|----------|------------------|
| **Nuxt** | `^4.2.1` | Framework หลัก — SSR/SPA, file-based routing, Nitro server |
| **Vue** | `^3.5.25` | UI + Composition API |
| **TypeScript** | - | ไฟล์ `.ts` / `<script setup lang="ts">` |
| **Tailwind CSS** | `^4.1.17` | สไตล์ผ่าน `@tailwindcss/vite` |
| **Pinia** | `^3.0.4` | State management (พร้อมใช้) |
| **@nuxt/image** | `2.0.0` | รูปลีก/ทีม จาก `media.api-sports.io` |
| **@nuxt/icon** | `2.1.0` | ไอคอน (Lucide, MDI ผ่าน Iconify) |
| **@nuxt/fonts** | `0.12.1` | โหลดฟอนต์ Google (Prompt) พร้อม preload |
| **@nuxtjs/seo** | `^3.2.2` | SEO / site config |
| **@vueuse/nuxt** | `^14.1.0` | Utilities สำหรับ Vue |
| **dayjs** | `^1.11.19` | จัดการวันที่ |
| **@vuepic/vue-datepicker** | `^12.1.0` | Date picker component |

**หมายเหตุ:** โปรเจกต์ใช้โฟลเดอร์ `app/` เป็น root ของซอร์สแอป (เช่น `app/pages`, `app/components`) ตามแนว Nuxt 4

---

## 3. โครงสร้างโฟลเดอร์หลัก

```
Lab-Score/
├── app/                              # ซอร์สแอปพลิเคชัน Nuxt
│   ├── app.vue                       # Root component — meta ทั่วทั้งไซต์
│   ├── assets/css/main.css           # Tailwind + global styles
│   ├── components/                   # Vue components (auto-import, pathPrefix: false)
│   │   ├── home/                     # หน้าแรก (6 ไฟล์)
│   │   ├── fixtures/                 # โปรแกรมแข่ง (1 ไฟล์)
│   │   ├── ui/                       # UI ทั่วไป (1 ไฟล์)
│   │   └── Standings/                # ตารางคะแนน (1 ไฟล์)
│   ├── composables/                  # Composables — logic ใช้ซ้ำ
│   │   ├── useFixtures.ts            # ดึงข้อมูล fixtures
│   │   └── useLeagueConfig.ts        # จัดการ config ลีก
│   ├── layouts/                      # Layouts
│   │   ├── default.vue               # Layout หลัก
│   │   └── NavigationBar.vue         # แถบนำทาง
│   ├── pages/                        # File-based routes (3 หน้า)
│   │   ├── index.vue                 # หน้าแรก
│   │   ├── fixture.vue               # หน้าโปรแกรมแข่ง
│   │   └── standings.vue             # หน้าตารางคะแนน
│   ├── types/                        # TypeScript interfaces
│   │   └── fixture.ts                # Types สำหรับ fixtures/matches
│   └── utils/                        # Pure functions
│       ├── apiFootball.ts            # API client (server-side)
│       ├── date.ts                   # จัดการวันที่
│       └── match.ts                  # แปลงข้อมูลแมตช์
├── server/
│   └── api/                          # Nitro API routes
│       ├── fixtures.get.ts           # GET /api/fixtures
│       └── standings.get.ts          # GET /api/standings
├── public/                           # Static assets
│   ├── favicon.ico
│   └── png.png                       # Logo
├── nuxt.config.ts                    # การตั้งค่า Nuxt
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── docs/
    └── PROJECT_STRUCTURE.md          # เอกสารนี้
```

---

## 4. รายละเอียดหน้า (`app/pages/`)

### 4.1 `index.vue` — หน้าแรก (`/`)

**หน้าที่:** แสดงโปรแกรมแข่งขันวันนี้ พร้อมกรองตามสถานะและลีก

**Composables ที่ใช้:**
- `useFixtures()` — ดึงข้อมูล fixtures, จัดการ date, statusFilter
- `useLeagueConfig()` — รายการลีก, selectedLeagues

**Components ที่ใช้:**
- `HomeSubNavbarVue` — แถบนำทางย่อย (เลือกวันที่, กรองสถานะ)
- `HomeLiveMatchBarVue` — แสดงจำนวนแมตช์สด
- `HomeMenuSidebarVue` — Sidebar เลือกลีก
- `HomeFixturesListVue` — แสดงรายการแมตช์

**Features:**
- กรองตามสถานะ: `all`, `live`, `upcoming`, `finished`
- กรองตามลีก: เลือกได้หลายลีก
- Empty state แยกตามสถานะที่เลือก
- Loading skeleton ขณะรอข้อมูล

### 4.2 `fixture.vue` — หน้าโปรแกรมแข่ง (`/fixture`)

**หน้าที่:** แสดงโปรแกรมแข่งขันแบบละเอียด

**Composables ที่ใช้:**
- `useLeagueConfig()` — รายการลีก, selectedLeagues

**Components ที่ใช้:**
- `DateNavigatorVue` — เลือกวันที่
- `HomeMenuSidebarVue` — Sidebar เลือกลีก
- `HomeFixturesListVue` — แสดงรายการแมตช์

**Features:**
- เลือกวันที่ได้ (หรือดูทั้งหมด)
- กรองตามลีก
- แสดงข้อความ error จาก API plan limit

### 4.3 `standings.vue` — หน้าตารางคะแนน (`/standings`)

**หน้าที่:** แสดงตารางคะแนนตามลีกที่เลือก

**Data Flow:**
- `useFetch('/api/standings')` — ดึงข้อมูลตารางคะแนน
- `LEAGUE_SLUG_TO_ID` — map slug → API id

**Components ที่ใช้:**
- `StandingsTableVue` — แสดงตารางคะแนน

**Features:**
- เลือกลีกได้ 5 ลีก: EPL, La Liga, Bundesliga, Serie A, Ligue 1
- แสดงฤดูกาลปัจจุบันอัตโนมัติ
- แสดง form (5 นัดล่าสุด)

---

## 5. รายละเอียด Components (`app/components/`)

### 5.1 `home/` — Components สำหรับหน้าแรก

| ไฟล์ | หน้าที่ |
|------|---------|
| `HomeFixturesList.vue` | แสดงรายการแมตช์แบบจัดกลุ่มตามลีก |
| `HomeMenuSidebar.vue` | Sidebar เลือกลีก (checkbox list) |
| `HomeSubNavbar.vue` | แถบนำทางย่อย (เลือกวันที่, กรองสถานะ) |
| `HomeLiveMatchBar.vue` | แสดงจำนวนแมตช์สด/ทั้งหมด |
| `HomeLoadingSkeleton.vue` | Skeleton ขณะโหลด |
| `HomeEmptyState.vue` | Empty state เมื่อไม่มีข้อมูล |

### 5.2 `fixtures/` — Components สำหรับโปรแกรมแข่ง

| ไฟล์ | หน้าที่ |
|------|---------|
| `DateCarousel.vue` | Carousel เลือกวันที่ |

### 5.3 `ui/` — UI Components ทั่วไป

| ไฟล์ | หน้าที่ |
|------|---------|
| `DateNavigator.vue` | Date picker สำหรับเลือกวันที่ |

### 5.4 `Standings/` — Components สำหรับตารางคะแนน

| ไฟล์ | หน้าที่ |
|------|---------|
| `StandingsTable.vue` | แสดงตารางคะแนน |

---

## 6. รายละเอียด Composables (`app/composables/`)

### 6.1 `useLeagueConfig.ts`

**หน้าที่:** จัดการ configuration ลีกทั้งโปรเจกต์

**Exports:**
```ts
// Constants
export const LEAGUES_UI: LeagueConfig[]       // รายการลีกสำหรับ UI
export const LEAGUE_SLUG_TO_ID                // Map slug → API id
export const DEFAULT_SELECTED_LEAGUES         // ลีกเริ่มต้น

// Types
export type LeagueSlug = keyof typeof LEAGUE_SLUG_TO_ID
export type LeagueId = typeof LEAGUE_SLUG_TO_ID[LeagueSlug]

// Composable
export function useLeagueConfig() {
  return {
    leaguesUI,           // รายการลีก
    selectedLeagues,     // Ref<string[]> ลีกที่เลือก
    selectedLeagueIds,   // Computed<number[]> API ids
    resetLeagues,        // รีเซ็ตเป็น default
  }
}
```

**ลีกที่รองรับ:**
| Slug | API ID | ชื่อ |
|------|--------|------|
| `ucl` | 2 | Champions League |
| `epl` | 39 | Premier League |
| `laliga` | 140 | La Liga |
| `seriea` | 135 | Serie A |
| `bundes` | 78 | Bundesliga |
| `thaileagueone` | 296 | Thai League 1 |
| `ligue1` | 61 | Ligue 1 |

### 6.2 `useFixtures.ts`

**หน้าที่:** ดึงและจัดการข้อมูล fixtures สำหรับหน้าแรก

**Return Values:**
```ts
{
  date,              // Computed<string> - วันที่จาก URL query
  statusFilter,      // Ref<StatusFilter> - กรองสถานะ
  fixturesData,      // Computed<LeagueGroup[]> - ข้อมูลจัดกลุ่ม
  pending,           // Ref<boolean> - กำลังโหลด
  error,             // Ref<Error | null> - error
  planMessage,       // Computed<string> - ข้อความจาก API plan limit
  liveMatchCount,    // Computed<number> - จำนวนแมตช์สด
  totalMatchCount,   // Computed<number> - จำนวนแมตช์ทั้งหมด
  retry,             // Function - ลองใหม่
}
```

**Features:**
- ผูกวันที่กับ URL query (`?date=YYYY-MM-DD`)
- Debounce query 500ms
- Auto-adjust date เมื่อ API plan limit error
- กรองตามลีกที่เลือกจาก `useLeagueConfig`
- จัดเรียง: live ก่อน, ตามด้วยจำนวนแมตช์

---

## 7. รายละเอียด Types (`app/types/`)

### 7.1 `fixture.ts`

```ts
// Status
export type MatchStatus = 'UPCOMING' | 'LIVE' | 'FT'
export type StatusFilter = 'all' | 'live' | 'upcoming' | 'finished'

// Models
export interface Team {
  name: string
  score: number
  logo: string
}

export interface Match {
  id: number
  timeDisplay: string      // "15:00" หรือ "67'"
  status: MatchStatus
  statusText: string       // "NS", "LIVE", "FT", etc.
  home: Team
  away: Team
}

export interface LeagueGroup {
  id: number
  name: string
  country: string
  season: string
  logo: string
  liveCount: number
  matches: Match[]
}

export interface LeagueConfig {
  id: string
  name: string
  logo: string
}

// API Response
export interface FixtureApiResponse {
  errors?: Record<string, any>
  response?: ApiFixture[]
}

export interface ApiFixture {
  fixture: {
    id: number
    date: string
    status: { short: string; elapsed?: number }
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
  goals: { home?: number; away?: number }
}
```

---

## 8. รายละเอียด Utils (`app/utils/`)

### 8.1 `date.ts`

```ts
// แปลง Date → "YYYY-MM-DD"
export const formatDateToISO = (date: Date): string

// คำนวณวันนี้โดยอิงเวลาไทย + ตัดรอบตี 05:00
export const getBangkokCurrentDate = (cutoffHour = 5): string

// บวก/ลบวัน
export const addDays = (dateStr: string, days: number): string
```

**Logic `getBangkokCurrentDate`:**
- แปลงเวลาเครื่องเป็น UTC
- บวก 7 ชั่วโมงเป็นเวลาไทย
- ถ้าเวลา < 05:00 น. ให้ถือว่าเป็น "เมื่อวาน"

### 8.2 `match.ts`

```ts
// แปลง ISO string → "HH:mm"
export function formatTimeHHmm(iso: string): string

// แปลง ApiFixture → Match
export function toMatchModel(fx: ApiFixture): Match

// กรองแมตช์ตามสถานะ
export function filterMatchesByStatus(matches: Match[], filter: string): Match[]
```

**Status Mapping:**
- `NS` → `UPCOMING`
- `FT`, `AET`, `PEN` → `FT`
- อื่นๆ → `LIVE`

### 8.3 `apiFootball.ts`

```ts
// เรียก API-Football (ใช้ได้เฉพาะ server-side)
export async function apiFootballFetch(path: string, query?: Record<string, any>)
```

**Provider Support:**
- `apisports` — header: `x-apisports-key`
- `rapidapi` — headers: `x-rapidapi-key`, `x-rapidapi-host`

**Error Handling:**
- ตรวจสอบ config ก่อนเรียก
- timeout 15 วินาที

---

## 9. รายละเอียด Server API (`server/api/`)

### 9.1 `fixtures.get.ts` — `GET /api/fixtures`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | ✅ | รูปแบบ `YYYY-MM-DD` |
| `leagues` | string | ❌ | Comma-separated league ids |
| `timezone` | string | ❌ | Default: `UTC` |

**Response:**
```json
{
  "results": 10,
  "response": [ /* ApiFixture[] */ ],
  "meta": {
    "date": "2024-01-15",
    "timezone": "UTC",
    "source": "single-fetch"
  }
}
```

**Error Handling:**
- ตรวจสอบ format วันที่
- กรองลีกฝั่ง server เพื่อลดขนาด response
- ส่ง empty array เมื่อ provider error

### 9.2 `standings.get.ts` — `GET /api/standings`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `league` | number | ✅ | League ID |
| `season` | number | ❌ | Default: คำนวณจากเดือนปัจจุบัน |

**Response:**
```json
{
  "standings": [
    {
      "rank": 1,
      "name": "Manchester City",
      "logo": "https://...",
      "played": 38,
      "win": 28,
      "draw": 5,
      "lose": 5,
      "goalsFor": 96,
      "goalsAgainst": 34,
      "goalsDiff": 62,
      "points": 89,
      "form": ["W", "W", "D", "L", "W"]
    }
  ],
  "league": {
    "id": 39,
    "name": "Premier League",
    "country": "England",
    "logo": "https://...",
    "season": 2024
  },
  "meta": { "leagueId": 39, "season": 2024 }
}
```

---

## 10. การตั้งค่า Nuxt (`nuxt.config.ts`)

### 10.1 Modules
```ts
modules: [
  '@nuxt/image',
  '@nuxt/icon',
  '@nuxt/fonts',
  '@pinia/nuxt',
  '@vueuse/nuxt',
  '@nuxtjs/seo',
]
```

### 10.2 Fonts (Preload)
```ts
fonts: {
  provider: 'google',
  families: [{ name: 'Prompt', weights: [400, 600], preload: true }],
  defaults: { subsets: ['thai', 'latin'] }
}
```

### 10.3 Image Domains
```ts
image: {
  domains: ['media.api-sports.io', 'media-4.api-sports.io'],
  format: ['webp'],
  quality: 85
}
```

### 10.4 Security & Performance
```ts
sourcemap: { server: false, client: false }  // ปิด sourcemap
nitro: { compressPublicAssets: true }         // บีบอัด assets
features: { inlineStyles: true }              // Inline critical CSS
```

### 10.5 Components
```ts
components: [{ path: '~/app/components', pathPrefix: false }]
```

### 10.6 Runtime Config
```ts
runtimeConfig: {
  apiFootball: {
    provider: process.env.API_FOOTBALL_PROVIDER,
    baseUrl: process.env.API_FOOTBALL_BASE_URL,
    key: process.env.API_FOOTBALL_KEY,      // Private
    host: process.env.API_FOOTBALL_HOST,
  },
  public: {
    fixtureFixedDate: process.env.FIXTURE_FIXED_DATE || "",
  }
}
```

### 10.7 SEO Site Config
```ts
site: {
  url: 'https://your-domain.com',
  name: 'Score Sanan - ผลบอลสด Livescore อัพเดทเรียลไทม์',
  description: 'เว็บเช็คผลบอลและตารางแข่งบอลแบบเรียลไทม์',
  defaultLocale: 'th'
}
```

---

## 11. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `API_FOOTBALL_PROVIDER` | ❌ | `apisports` (default) หรือ `rapidapi` |
| `API_FOOTBALL_BASE_URL` | ✅ | `https://v3.football.api-sports.io` |
| `API_FOOTBALL_KEY` | ✅ | API key (private) |
| `API_FOOTBALL_HOST` | ❌ | RapidAPI host header |
| `FIXTURE_FIXED_DATE` | ❌ | สำหรับทดสอบวันที่คงที่ |

---

## 12. Data Flow

### 12.1 โปรแกรมแข่ง (Fixtures)

```
Browser
  → useFixtures() / useFetch('/api/fixtures')
    → server/api/fixtures.get.ts
      → apiFootballFetch('/fixtures', { date, timezone })
        → API-Football (header มี key)
      ← JSON { response: ApiFixture[], errors? }
    ← JSON { results, response, meta }
  → toMatchModel() แปลงเป็น Match[]
  → groupByLeague() จัดกลุ่มเป็น LeagueGroup[]
  → HomeFixturesList แสดงผล
```

### 12.2 ตารางคะแนน (Standings)

```
Browser
  → useFetch('/api/standings', { league, season })
    → server/api/standings.get.ts
      → apiFootballFetch('/standings', { league, season })
        → API-Football
      ← JSON { response: [{ league: { standings } }] }
    ← JSON { standings: StandingRow[], league, meta }
  → StandingsTable แสดงผล
```

---

## 13. Conventions ที่ควรปฏิบัติตาม

1. **แยก Concern:** แปลงข้อมูล API → `utils/` หรือ `composables/` — ไม่ยัด logic ใน template
2. **ชื่อ Component:** `pathPrefix: false` → ชื่อไฟล์ต้อง unique (เช่น `HomeFixturesList` ไม่ซ้ำกับ `FixturesList`)
3. **ภาษาไทย:** ทุกข้อความใน UI เป็นภาษาไทย
4. **เวลาไทย:** ใช้ `getBangkokCurrentDate()` สำหรับ "วันนี้"
5. **รูปภาพ:** ใช้ `<NuxtImg>` พร้อม `format="webp"` และ `preload` สำหรับ logo
6. **API Key:** อย่า hardcode — ใช้ `runtimeConfig` เสมอ
7. **Error Handling:** ตรวจสอบ `planMessage` จาก API plan limit

---

## 14. จุดที่มักต้องอัปเดตเมื่อขยายฟีเจอร์

| งาน | ไฟล์ที่เกี่ยวข้อง |
|-----|-------------------|
| เพิ่มลีก | `useLeagueConfig.ts` — `LEAGUES_UI`, `LEAGUE_SLUG_TO_ID`, `DEFAULT_SELECTED_LEAGUES` |
| เพิ่มหน้าใหม่ | `app/pages/*.vue` + import components |
| เพิ่ม API endpoint | `server/api/*.ts` + composable |
| เปลี่ยน provider API | `.env` + `nuxt.config.ts` |
| SEO หน้าใหม่ | `useHead()` ใน page |
| Cache strategy | `routeRules` ใน `nuxt.config.ts` |

---

## 15. สรุปสำหรับ AI Agent

- **Framework:** Nuxt 4 + Vue 3 + TypeScript
- **ภาษา:** ไทย (UI) + English (code)
- **API:** API-Football ผ่าน proxy ภายใน (`server/api/`)
- **Security:** API key ไม่เปิดเผยใน client
- **Config ลีก:** รวมศูนย์ที่ `useLeagueConfig.ts`
- **เวลา:** ใช้เวลาไทย (UTC+7) พร้อม cutoff 05:00 น.
- **Components:** `pathPrefix: false` → ชื่อไฟล์คือชื่อ tag

---

*อัปเดตล่าสุด: เมษายน 2026*
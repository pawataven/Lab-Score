# Lab-Score Project Structure

This document explains the current frontend architecture of `Lab-Score` and how it connects to `lab-score-api`.

## High-Level Architecture

`Lab-Score` is a Nuxt 4 application responsible for:

- rendering UI
- handling page-level state
- formatting and grouping normalized data from the backend

It is not responsible for:

- provider switching
- secret management
- raw API-Football calls
- raw TheSportsDB calls

## Top-Level Layout

```text
Lab-Score/
  app/
    app.vue
    assets/css/main.css
    components/
    composables/
    layouts/
    pages/
    types/
    utils/
  docs/
    PROJECT_STRUCTURE.md
    CODE_REVIEW_FINDINGS.md
  public/
  nuxt.config.ts
  package.json
  .env
  .env.example
```

## Folder Responsibilities

### `app/components`

Reusable visual blocks.

Subfolders:

- `home/`: home page widgets such as fixture list, live bar, sidebar, navbar
- `fixtures/`: date carousel and fixtures-page-specific UI
- `Standings/`: standings table
- `ui/`: shared generic UI pieces like date navigation

### `app/composables`

Shared stateful logic.

Current composables:

- `useFixtures.ts`: fetches fixtures from backend, handles refresh, groups response for UI
- `useLeagueConfig.ts`: defines supported leagues and selected league state

### `app/pages`

Route-level entry points.

- `index.vue`: homepage
- `fixture.vue`: full fixtures page
- `standings.vue`: standings page
- `backend-test.vue`: backend/database sanity page

### `app/types`

TypeScript contracts used by the frontend.

Current important file:

- `fixture.ts`

It contains:

- API response shape expected from backend
- normalized frontend `Match` model
- grouped `LeagueGroup` model

### `app/utils`

Pure transformation utilities.

Current important files:

- `date.ts`: Bangkok business-day utilities
- `fixtures.ts`: groups normalized fixture responses by league
- `match.ts`: converts backend fixture data into frontend match cards
- `matchLabel.ts`: time-of-day labels and badge colors

## Current Data Flow

### Fixtures

```text
Page or composable
  -> useFetch / $fetch
    -> ${NUXT_PUBLIC_API_BASE}/fixtures
      -> NestJS fixtures controller/service
        -> provider layer
      <- normalized fixture response
    -> buildLeagueGroups()
    -> HomeFixturesList.vue
```

Important detail:

- The frontend sends one `date`
- The backend currently treats that as a single calendar-day fetch
- The frontend still has Bangkok business-day logic for UI behavior and rollover
- Full cross-midnight business-day aggregation is intentionally deferred until database-backed querying is added

### Standings

```text
standings.vue
  -> backend /standings
    -> normalized standings response
  -> StandingsTable.vue
```

The frontend does not know or care whether the data came from SportsDB or API-Football.

## Business Day Rules

Defined in [`app/utils/date.ts`](../app/utils/date.ts).

Rules:

- Timezone: `Asia/Bangkok`
- Cutoff: `05:00`
- `00:00-04:59` still belongs to the previous business day for UI logic

This affects:

- default selected date
- date rollover timers
- labels like `เช้ามืด`

## Time Label Rules

Defined in [`app/utils/matchLabel.ts`](../app/utils/matchLabel.ts).

Rules:

- `00:00-04:59` -> `เช้ามืด`
- `05:00-11:59` -> `เช้า`
- `12:00-16:59` -> `บ่าย`
- `17:00-23:59` -> `ค่ำ`

Output includes:

- `label`
- `labelWithDate`
- `className`

## Fixture Section UI Contract

Defined across:

- [`app/utils/fixtures.ts`](../app/utils/fixtures.ts)
- [`app/utils/match.ts`](../app/utils/match.ts)
- [`app/utils/matchLabel.ts`](../app/utils/matchLabel.ts)
- [`app/components/home/HomeFixturesList.vue`](../app/components/home/HomeFixturesList.vue)

This sectioning behavior is an intentional UI requirement and should be preserved.

Expected grouping behavior:

- Fixtures are grouped by league first
- Inside each league, matches are grouped into visible sections
- Section titles are contextual Thai labels such as:
  - `ทั้งหมด`
  - `คืนนี้`
  - `เช้ามืด (20 เม.ย.)`
  - `เช้า`
  - `บ่าย`
  - `ค่ำ`

Expected card behavior:

- Each match row shows a time-of-day badge on the left
- The badge color must come from `labelClassMap`
- Upcoming matches may show `labelWithDate` instead of only the short label
- Section headers and left-side badges must stay visually aligned with the current fixtures layout

Important rule:

- Do not flatten all matches into a single unsectioned list unless product requirements explicitly change
- Do not remove section headers like `ค่ำ`, `คืนนี้`, or `เช้ามืด (20 เม.ย.)`
- If match grouping changes, update `buildMatchSections()` instead of patching the template ad hoc

## Runtime Configuration

Defined in [`nuxt.config.ts`](../nuxt.config.ts).

Important public runtime config:

```ts
runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000/api',
  },
}
```

This app should only point to the Nest backend.

## Supported Leagues in UI

Configured in [`app/composables/useLeagueConfig.ts`](../app/composables/useLeagueConfig.ts).

Current set:

- Champions League
- Premier League
- La Liga
- Serie A
- Bundesliga
- Ligue 1
- Thai League 1

## Files Team Members Usually Touch

When changing fixture rendering:

- `app/types/fixture.ts`
- `app/utils/match.ts`
- `app/utils/fixtures.ts`
- `app/components/home/HomeFixturesList.vue`

When changing league selection:

- `app/composables/useLeagueConfig.ts`
- `app/components/home/HomeMenuSidebar.vue`

When changing date behavior:

- `app/utils/date.ts`
- `app/components/ui/DateNavigator.vue`
- `app/pages/fixture.vue`
- `app/composables/useFixtures.ts`

When changing runtime API destination:

- `.env`
- `.env.example`
- `nuxt.config.ts`

## Important Constraints

- Do not reintroduce `server/api/*.get.ts` proxy routes in Nuxt.
- Do not put provider-specific code into the frontend.
- Do not expose provider secrets through public runtime config.
- Keep UI strings in Thai and code identifiers in English.

## Cross-Project Relationship

Frontend repo:

- [`../README.md`](../README.md)

Backend repo:

- [`../../lab-score-api/README.md`](../../lab-score-api/README.md)
- [`../../lab-score-api/SETUP-GUIDE.md`](../../lab-score-api/SETUP-GUIDE.md)

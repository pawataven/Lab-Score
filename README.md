# Lab-Score Frontend

Nuxt 4 frontend for `ScoreSanan`. This app renders the public football UI and talks only to the NestJS backend BFF at `lab-score-api`.

## What This App Does

- Home page with live/upcoming/finished fixture filters
- Full fixtures page with date navigation
- Standings page for supported leagues
- Backend test page for verifying frontend -> backend -> database flow

## Architecture Summary

The frontend is intentionally thin:

- UI and page state live in Nuxt
- All football data comes from the backend BFF
- The frontend does not call API-Football or TheSportsDB directly
- Provider switching is a backend concern only

Request flow:

```text
Browser
  -> Nuxt page/composable
    -> NUXT_PUBLIC_API_BASE
      -> NestJS backend (/api/live, /api/fixtures, /api/standings)
        -> provider layer (API-Football / TheSportsDB)
```

## Runtime Configuration

Environment file:

- [`.env.example`](./.env.example)

Current public config:

```env
PORT=3000
NUXT_PUBLIC_API_BASE=http://localhost:4000/api
```

`NUXT_PUBLIC_API_BASE` must point to the Nest backend, not to any external football API.

## Main Source Structure

```text
app/
  components/
    home/
    fixtures/
    Standings/
    ui/
  composables/
    useFixtures.ts
    useLeagueConfig.ts
  layouts/
  pages/
    index.vue
    fixture.vue
    standings.vue
    backend-test.vue
  types/
    fixture.ts
  utils/
    date.ts
    fixtures.ts
    match.ts
    matchLabel.ts
docs/
  PROJECT_STRUCTURE.md
  CODE_REVIEW_FINDINGS.md
```

## Key Frontend Modules

### `app/composables/useFixtures.ts`

Shared fixture-fetching composable for the home page.

Responsibilities:

- Reads the business date from the route query
- Calls backend `/fixtures`
- Tracks loading, retry, and error state
- Builds grouped league data for rendering
- Refreshes at the next business-day rollover

### `app/composables/useLeagueConfig.ts`

Central league configuration for UI selection and backend league ids.

Supported ids currently include:

- `2` Champions League
- `39` Premier League
- `140` La Liga
- `135` Serie A
- `78` Bundesliga
- `61` Ligue 1
- `296` Thai League 1

### `app/utils/date.ts`

Contains the frontend business-day rules.

Important behavior:

- Business timezone is `Asia/Bangkok`
- Business-day cutoff is `05:00`
- `00:00-04:59` still belongs to the previous business day in UI logic

### `app/utils/matchLabel.ts`

Time-of-day label utility for fixture cards.

Current labels:

- `เช้ามืด`
- `เช้า`
- `บ่าย`
- `ค่ำ`

For `เช้ามืด`, the utility can append the next-day context like `เช้ามืด (13 เม.ย.)`.

## Pages

### `/`

Primary home page.

- Uses `useFixtures()`
- Shows selected leagues, fixture groups, and live counts
- Uses the Bangkok business date by default

### `/fixture`

Detailed fixtures page.

- Allows explicit date navigation
- Reuses the same fixture transformation stack as the home page

### `/standings`

League standings page.

- Fetches normalized standings from the backend
- Frontend does not care which provider produced the data

### `/backend-test`

Development/support page used to verify backend and database integration.

## Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Team Notes

- Do not add direct external API calls in Nuxt pages, components, or composables.
- Keep business logic out of templates; put it in composables or pure utils.
- If provider behavior changes, prefer updating backend docs and backend services first.
- Some PowerShell terminals may display Thai text as mojibake when reading files; verify actual UI behavior in browser before assuming the file content is broken.

## Related Docs

- [Project structure and data flow](./docs/PROJECT_STRUCTURE.md)
- [Handoff notes and remaining risks](./docs/CODE_REVIEW_FINDINGS.md)
- [Backend setup guide](../lab-score-api/SETUP-GUIDE.md)

# Handoff Notes and Known Risks

This file is the current handoff memo for engineers continuing work on `Lab-Score` and `lab-score-api`.

## Current State

The project has already been migrated to a BFF-style architecture:

- frontend -> Nest backend only
- backend -> external providers
- frontend no longer calls API-Football or TheSportsDB directly

This is the most important architectural invariant to preserve.

## Things That Are Stable

- `NUXT_PUBLIC_API_BASE` points to Nest backend
- backend supports `/api/live`, `/api/fixtures`, `/api/standings`
- provider switching is backend-only via env
- standings support runtime switching and fallback
- fixtures and live are already normalized before reaching the UI

## Known Runtime Risks

### 1. Port `4000` conflicts in development

This was a recurring source of false `404` responses.

Root cause:

- local Nest process and Docker `api` container both trying to bind `:4000`

Current mitigation:

- backend `docker-compose.yml` keeps the `api` service under the `containerized` profile
- `lab-score-api/scripts/start-dev.ps1` stops an existing listener before running `nest start --watch`

Recommended team habit:

- use Docker for `postgres`
- run Nest locally with `bun run start:dev`

### 2. PostgreSQL may be unavailable at startup

The backend was intentionally changed to degraded mode instead of crashing the whole API.

Behavior:

- app still starts
- health endpoint returns `degraded`
- database-backed endpoints or features may not work fully

### 3. Provider data completeness is not identical

Current practical behavior:

- `LIVE`: API-Football only
- `FIXTURES`: currently best with API-Football
- `STANDINGS`: SportsDB first, API-Football fallback if results look incomplete

This means frontend rendering can be stable while upstream source quality still varies by provider.

### 4. Business-day aggregation is intentionally deferred

Current state:

- frontend business-day UI uses Bangkok time and a `05:00` cutoff
- backend fixtures fetch still use a single provider `date`

Why this is intentional:

- full business-day aggregation across midnight needs two provider-day fetches
- that is not ideal on free-plan constraints
- the long-term plan is to solve this with database-backed querying after fixtures are stored locally

## Recommended Next Backend Milestones

### High priority

- add a real fixture persistence model in Prisma
- add sync/upsert jobs for fixture snapshots
- query fixtures from database first, providers second

### Medium priority

- add explicit cache abstraction instead of in-service `Map`
- add provider strategy/factory abstraction if provider count grows
- add structured logs around fallback decisions

### Low priority

- add tests around provider fallback rules
- add business-day database query helpers
- add more complete standings coverage for leagues beyond current mappings

## Recommended Next Frontend Milestones

- keep the current UI fetching flow unchanged
- when backend becomes DB-backed, do not move business-day aggregation into Nuxt
- if new labels or fixture card variants are needed, extend `match.ts` and `matchLabel.ts` instead of adding ad hoc template logic

## File Hotspots

If a change breaks fixture rendering, start with:

- `Lab-Score/app/composables/useFixtures.ts`
- `Lab-Score/app/utils/fixtures.ts`
- `Lab-Score/app/utils/match.ts`
- `Lab-Score/app/components/home/HomeFixturesList.vue`
- `lab-score-api/src/modules/fixtures/fixtures.service.ts`

If a change breaks standings, start with:

- `Lab-Score/app/pages/standings.vue`
- `Lab-Score/app/components/Standings/StandingsTable.vue`
- `lab-score-api/src/modules/standings/standings.service.ts`
- `lab-score-api/src/common/league.map.ts`

## Development Workflow That Has Been Stable

Backend:

```bash
cd lab-score-api
npm install
npm run dev:db
bun run start:dev
```

Frontend:

```bash
cd Lab-Score
npm install
npm run dev
```

## Do Not Regress

- Do not restore Nuxt `server/api/*.get.ts` routes
- Do not move provider logic into controllers
- Do not add direct external football API calls in frontend
- Do not hardcode provider selection in UI code

## Reference Docs

- [Frontend architecture](./PROJECT_STRUCTURE.md)
- [Frontend README](../README.md)
- [Backend README](../../lab-score-api/README.md)
- [Backend setup guide](../../lab-score-api/SETUP-GUIDE.md)

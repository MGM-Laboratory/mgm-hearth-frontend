# mgm-hearth-frontend

Hearth is the Next.js (App Router) management web app for **Admin + Maintainer** at `hearth.labmgm.org`, and the host for the **public QR asset detail pages** at `/a/{publicId}`. It is iteration 2 in the 0→4 build sequence and consumes the shared contracts from the workspace root.

## Stack

- Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui (Radix)
- Auth.js v5 with Keycloak OIDC (`hearth-web` client, `mgm` realm)
- TanStack Query v5 · Zustand · React Hook Form · Zod
- `openapi-typescript` + `openapi-fetch` (types generated from `../API_CONTRACT.yaml`)
- `@microsoft/fetch-event-source` (SSE with Bearer token)
- `next-intl` (cookie-based locale, no URL prefix)
- TipTap (rich text), Recharts (admin stats), Lucide (stroke 2.25 round caps)
- Sentry (Next.js SDK; no-op when DSN empty)

## Repo layout

```
app/                    Next.js App Router
  (public)/a/[publicId] Public QR asset page (unauthenticated)
  (app)/                Authenticated shell
    dashboard
    assets/             list, [modelId], new, [modelId]/edit, [modelId]/units, import
    requests/           borrow, procurement, infra, room, license, general
    catalogs/           infra, software-ai, stickers
    admin/              users, settings, stats   (Admin only)
    notifications
  not-it                NOT_IT_MEMBER gate screen
  api/auth              Auth.js handlers
  api/health            container health probe
components/             ui/, shared/, assets/, requests/, catalogs/, admin/, public/
lib/                    api/, auth/, sse/, i18n/, query/, utils/
stores/                 Zustand slices
messages/               en.json, id.json (mirror ../i18n)
middleware.ts           auth + IT-gate + locale cookie
tests/                  unit (Vitest), e2e (Playwright), mocks (MSW)
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Generate API types from the workspace OpenAPI contract:
   ```bash
   npm run generate:api
   ```
3. Bring up the backend from the workspace root:
   ```bash
   cd .. && docker compose up backend
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

Environment is read from `../.env` (single root env, shared with backend + other surfaces). See `../.env.example` for the keys this app uses (`HEARTH_*`, `KEYCLOAK_*`, `SENTRY_DSN_HEARTH`, `APP_*`).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Next.js dev server on `:3000` |
| `npm run build` | Production build (`output: 'standalone'`) |
| `npm run start` | Run the built server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests with MSW |
| `npm run e2e` | Playwright smoke specs |
| `npm run generate:api` | Regenerate `lib/api/schema.d.ts` from `../API_CONTRACT.yaml` |
| `npm run check:api-drift` | Regenerate then `git diff --exit-code` (used in CI) |
| `npm run check:i18n-sync` | Verify `messages/{en,id}.json` mirror `../i18n/{en,id}.json` |

## How it consumes the workspace

- `../API_CONTRACT.yaml` — single source for API types. Run `npm run generate:api` after every backend contract change.
- `../CONVENTIONS.md` — error envelope, error-code→i18nKey map, SSE events, pagination, permissions matrix.
- `../DATA_MODEL.md` — entity shapes the UI binds to.
- `../DESIGN_SYSTEM.md` + `../example-tailwind.config.js` — colors, type scale, fonts, icon stroke. Tokens live in `tailwind.config.ts` + `app/globals.css`.
- `../patterns/` — 80 SVG motif tiles, copied into `public/patterns/` for `<PatternAccent />`.
- `../i18n/{en,id}.json` — translation key registry; mirrored verbatim into `messages/` and extended.
- `../.env.example` — the keys this app reads.

## Auth & gating

- Auth.js v5 + Keycloak (`hearth-web` client). Session persists `access_token`/`refresh_token`/`expires_at`/`role`/`groups`; the JWT is refreshed ~60 s before expiry.
- `lib/auth/session.ts#useBearerSync` forwards the active token into the openapi-fetch client + SSE.
- `middleware.ts` redirects unauthenticated users to Keycloak and Members (non-IT) to `/not-it`.
- `<RoleGate />` + `<AdminOnly />` gate Admin-only nav and actions client-side; the server enforces the same via `FORBIDDEN` / `NOT_IT_MEMBER`.

## Realtime

- SSE: `lib/sse/client.ts` subscribes to `GET /realtime` with the Bearer token via `@microsoft/fetch-event-source`. Reconnects with backoff, resumes via `Last-Event-ID`.
- `lib/sse/invalidate.ts` maps all 11 events from CONVENTIONS to TanStack Query `invalidateQueries` calls — the single source of truth for what gets refreshed when.

## i18n

- Cookie-based locale (`NEXT_LOCALE`), no URL prefix. Resolution: cookie → `Accept-Language` → `APP_DEFAULT_LOCALE` (en).
- Money: IDR with `Intl.NumberFormat("id-ID")`, no decimals. Dates: always Asia/Jakarta for display.
- Only system strings are translated; user-generated content (asset names, descriptions, ticket purposes) stay as written.
- `npm run check:i18n-sync` ensures `messages/{en,id}.json` mirror `../i18n/{en,id}.json`.

## Design system discipline

- One display heading per page (enforced by `<PageHeader />`).
- Pattern motifs are accents only — sidebar corner, empty states, 404, auth/gate screens, favicon. Never wallpaper.
- Yellow never carries text on white. Red text only ≥18 px or ≥14 px bold (the badge color rule).
- Helper text uses `--ink-3` only ≥14 px (`caption` token size).
- Stroke-only Lucide via the `<Icon />` wrapper (stroke 2.25, round caps). No emoji anywhere.

## Build sequence

This is iteration 2. Previous: `mgm-hearth-backend` (iter 1). Next: `mgm-pinjam-frontend` (iter 3) — will reuse the same `lib/api/schema.d.ts` generation pattern and the workspace-level `i18n/` and `DESIGN_SYSTEM.md`.

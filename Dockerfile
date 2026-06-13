# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=22.13

# ── deps ─────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Don't fail if no lockfile exists yet — first build of a green-field repo.
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

# ── builder ──────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `lib/api/schema.d.ts` is the committed-generated OpenAPI client types. The
# workspace-root API_CONTRACT.yaml is not in the build context for standalone
# CI/CD builds — the committed schema is the source of truth at image-build
# time. Regenerate locally with `npm run generate:api` and commit when the
# contract changes.
# Public, browser-inlined config. NEXT_PUBLIC_* are baked into the JS bundle at
# build time (next.config.ts derives them from these), so they MUST be present
# now — runtime env can't change them later. CI passes the prod values via
# --build-arg; the defaults below keep `docker compose up --build` working for
# local dev. (Without this, the browser bundle hard-codes localhost:8080.)
ARG HEARTH_API_URL=http://localhost:8080/api/v1
ARG PINJAM_PUBLIC_URL=https://pinjam.labmgm.org
ARG KEYCLOAK_ISSUER_URL=https://iam.labmgm.org/realms/mgm
ARG APP_PUBLIC_ASSET_BASE_URL=https://hearth.labmgm.org/a
ENV HEARTH_API_URL=$HEARTH_API_URL \
    PINJAM_PUBLIC_URL=$PINJAM_PUBLIC_URL \
    KEYCLOAK_ISSUER_URL=$KEYCLOAK_ISSUER_URL \
    APP_PUBLIC_ASSET_BASE_URL=$APP_PUBLIC_ASSET_BASE_URL

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── runner ───────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]

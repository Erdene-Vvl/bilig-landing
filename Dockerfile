# syntax=docker/dockerfile:1
#
# Production image for bilig-landing (bilig.systems / www.bilig.systems).
# Built in CI (GitHub Actions), pushed to GHCR and pulled by the droplet —
# the server has 2 vCPU and never builds this itself.
#
# The landing site is static content compiled into the bundle — no backend
# calls, no secrets — but the homepage IS prerendered at build time, so the
# one env var it does read (TENANT_URL, where the CTAs hand off to) has to
# be supplied as a build arg here, not a runtime container env: setting it
# on `docker run` would have no effect on an already-static page.

# ── deps ─────────────────────────────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── build ────────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG TENANT_URL
ENV TENANT_URL=${TENANT_URL} \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── runner ───────────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder /app/public ./public
# `standalone` already carries the traced node_modules and a server.js entry.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

# BILIG LMS — landing page

Next.js (App Router) + TypeScript + Tailwind CSS port of the BILIG LMS
marketing landing page (dark/light themed, Mongolian copy).

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4** — brand tokens as CSS variables, bridged into Tailwind
  utilities via `@theme inline` in `app/globals.css`
- **next/font** — Unbounded / Onest / JetBrains Mono, self-hosted with the
  Cyrillic subset for the Mongolian copy

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/                    # App Router: layout, page, global styles/tokens
components/
  ui/                   # Generic primitives: Button, Eyebrow, SectionHeading,
                         # Reveal (scroll-in animation), Arc, ThemeToggle
  layout/               # Navbar, Footer
  sections/             # One file per landing-page section (Hero, Problems,
                         # Features, DayFlow, Modules, Pricing, FAQ, CTA, ...);
                         # sections with a distinct visual (schedule grid,
                         # dashboard mocks, plan cards, contact form) get a
                         # same-named subfolder (pricing/ also holds
                         # PlanInquiry, the plan-inquiry form under the
                         # price table; contact/ holds ContactForm, which
                         # the custom plan's "Ярилцах" button scrolls to)
  icons.tsx             # Shared inline SVG icon set
data/content.ts         # All copy + structured content (typed), kept out of
                         # components so they stay presentational
lib/
  colors.ts             # Brand color name -> static Tailwind class lookup
                         # (Tailwind needs literal class strings, not
                         # `text-${color}` interpolation)
  emphasis.tsx           # Renders "*emphasised*" substrings from content.ts
                         # as brand-colored <em>
  money.tsx              # Works around the ₮ (Tugrik) glyph missing from
                         # the display typeface
```

## Theming

Dark is the default and primary theme. `data-theme="dark" | "light"` on
`<html>` switches the whole palette — every brand/surface/text color is a CSS
variable in `app/globals.css`, redefined under `[data-theme="light"]`. The
initial value is stamped before hydration by an inline script in
`app/layout.tsx` (no flash of the wrong theme); `ThemeToggle` flips the
attribute and persists the choice to `localStorage`.

Tailwind utilities like `bg-blue`, `text-txt-2`, `border-line` resolve to
these variables via `@theme inline`, so they react to the theme switch
automatically. Bespoke, brand-specific chrome that doesn't fit Tailwind's
utility model (decorative arcs, the gradient promo band, the schedule grid,
staggered cards, the FAQ accordion marker, scroll-reveal) lives in
`app/globals.css` under `@layer components` as `.c-*` classes.

## Deployment

Live at **https://bilig.systems** and **https://www.bilig.systems** — both
names serve this site directly; neither redirects to the other.

Push to `main` is the whole deploy story. `.github/workflows/deploy.yml`:

1. **verify** — `npm ci`, `npm run lint`, `npm run typecheck`.
2. **build** — builds `Dockerfile` and pushes
   `ghcr.io/erdene-vvl/bilig-landing:<commit-sha>` (plus `:latest`) to GHCR.
   The droplet has 2 vCPU and never builds the image itself.
3. **deploy** — SSHes to the droplet as `deploy` and runs
   `/opt/bilig/deploy.sh landing <image>`, which pins the tag in
   `/opt/bilig/app/.env`, pulls, restarts the container, waits for its
   healthcheck, and **rolls back to the previous image** if it never turns
   healthy. A smoke test then checks both public URLs.

Because the tag is the commit SHA, a rollback is just re-running an older
deploy, and a reboot brings back exactly the image CI last verified.

### Server layout

The site runs as the `landing` service of the shared `bilig` compose project
at `/opt/bilig/app/docker-compose.prod.yml`, listening on `127.0.0.1:3103`
alongside `student` (3100), `tenant` (3101) and `admin` (3102). nginx
(`/etc/nginx/sites-available/bilig.systems.conf`) terminates TLS for both
hostnames with a Let's Encrypt certificate (`bilig-landing`) and proxies to
3103; plain HTTP 301s to HTTPS.

Two same-origin route handlers talk to the platform backend at runtime,
through `BACKEND_URL` (a plain container env var, default
`https://api.bilig.systems`; see `lib/env.ts`):

- `GET /api/plans` → `GET /v1/public/pricing` — the price table.
- `POST /api/plan-inquiry` → `POST /v1/public/tickets/plan-inquiry` — the
  negotiated plan's inquiry form under the price table
  (`components/sections/pricing/PlanInquiry.tsx`). It lands in the admin
  app's **Хүсэлтүүд** queue as a plan inquiry. The handler limits each
  visitor to 3 filed inquiries per 10 minutes and drops honeypot hits, keyed
  on the last `X-Forwarded-For` entry nginx sets, so nginx must keep passing
  it. Backend failures other than 400/429 reach the visitor as a 502.

One call skips this server: the contact section's form (`ContactForm`, the
"Ярилцах" target) posts **from the browser** straight to
`POST ${BACKEND_URL}/v1/public/leads` (`leadsEndpoint` in `lib/env.ts`), so the
backend's per-IP throttle sees each visitor's own address. The backend's
`CORS_ORIGINS` must therefore list this site's origins.

No secrets.

Repo secret: `DEPLOY_SSH_KEY`, the private half of a deploy-only SSH key
authorized for the `deploy` user on the droplet.

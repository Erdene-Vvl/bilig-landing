import { signupUrl } from "./links";

/**
 * Base URL of the tenant (school-admin) app — one of the sibling BILIG
 * services this landing page hands off to.
 *
 * Set via the `TENANT_URL` env var in the deploy environment (a Docker
 * build arg). Falls back to production rather than to "#": an unset var
 * used to turn every "Үнэгүй турших" button into a dead link, and pointing
 * at the real app is the only fallback that still works. `||`, not `??`:
 * CI passes this through as a Docker build arg, and an unset GitHub Actions
 * variable interpolates to an empty string, not `undefined`.
 *
 * Trailing slash stripped so callers can always do `${tenantUrl}/mn/auth...`
 * and get exactly one slash, regardless of how the env var was written
 * (ops' local `.env` has "https://tenant.bilig.systems/").
 */
export const tenantUrl = (process.env.TENANT_URL || "https://tenant.bilig.systems").replace(/\/+$/, "");

/** Every "Үнэгүй турших" / "Туршиж үзэх" button: the registration form. */
export const tenantSignupUrl = signupUrl(tenantUrl);

/** Every "Демо үзэх" button: the tenant app signs the visitor into its
 * read-only demo organization. */
export const tenantDemoUrl = `${tenantUrl}/mn/auth?demo=true`;

/**
 * Origin of the platform backend (api.bilig.systems), WITHOUT the `/v1`
 * version prefix — request paths carry that themselves, same convention as
 * the admin and tenant apps' own `BACKEND_API_URL`.
 *
 * Read on the server: by the `/api/plans` route handler (see
 * app/api/plans/route.ts), and to build `leadsEndpoint`, which the page hands
 * to the contact form — the API origin is public, nothing here is secret. Unlike
 * `tenantUrl` this doesn't need to be a Docker build arg — the route
 * handler runs live on the deployed Node server, so a plain runtime
 * container env var reaches it fine and can change without a rebuild.
 *
 * Defaults to production rather than to empty: pricing comes from the
 * backend now, and an unset var on the droplet would leave the pricing
 * section showing an error instead of the real plans. Override it with
 * `BACKEND_URL` to point at a local API.
 */
export const backendUrl = (process.env.BACKEND_URL || "https://api.bilig.systems").replace(/\/+$/, "");

/**
 * Where the contact form posts, straight from the visitor's browser.
 *
 * Not proxied through this site like `/api/plans`: the backend throttles
 * leads per client IP, and behind a proxy every visitor would share this
 * server's IP — one busy afternoon would lock the form for everyone. The
 * backend's address is public anyway; it needs this site's origin in its
 * `CORS_ORIGINS`.
 */
export const leadsEndpoint = `${backendUrl}/v1/public/leads`;

/**
 * Base URL of the tenant (school-admin) app — one of the sibling BILIG
 * services this landing page hands off to. All "Эхлэх / Турших / Демо
 * үзэх" CTAs point here now that the on-page lead-capture form is gone;
 * there's no sign-up flow left inside this site itself.
 *
 * Set via the `TENANT_URL` env var in the deploy environment. Falls back
 * to "#" locally so an unset var is a visibly inert link rather than a
 * broken one.
 */
export const tenantUrl = process.env.TENANT_URL ?? "#";

/** Same destination, flagged so the tenant app can open straight into its
 * demo mode — used by every "Демо үзэх" button specifically. */
export const tenantDemoUrl = `${tenantUrl}${tenantUrl.includes("?") ? "&" : "?"}demo=true`;

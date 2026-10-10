/**
 * The tenant app's sign-up entry, optionally pre-selecting a plan and term.
 *
 * Goes through the tenant app's `/auth` rather than straight to its
 * registration form: `/auth` sends a visitor who is already signed in on to
 * their dashboard (or the plan they picked) instead of registering a second
 * organization. `intent=signup` is what makes a signed-out visitor land on the
 * registration form rather than the login page — every "Үнэгүй турших" and
 * "Эхлэх" button is for someone who has no account yet.
 *
 * Pure (no env access) so the client-side pricing cards can build it from the
 * `tenantUrl` prop they are handed.
 */
export function signupUrl(tenantUrl: string, plan?: string, termMonths?: number): string {
  const query = new URLSearchParams({ intent: "signup" });
  if (plan) query.set("plan", plan);
  if (plan && termMonths) query.set("term", String(termMonths));
  return `${tenantUrl}/mn/auth?${query.toString()}`;
}

/** The on-page contact section ("Ярилцах", "Холбоо барих"). */
export const CONTACT_ANCHOR = "holboo";

/**
 * Fired by the custom plan's "Ярилцах" button so the contact form can note
 * which plan the enquiry is about. A window event rather than shared state:
 * the pricing cards and the form are separate client islands.
 */
export const LEAD_PLAN_EVENT = "bilig:lead-plan";

export type LeadPlanDetail = { code: string; name: string };

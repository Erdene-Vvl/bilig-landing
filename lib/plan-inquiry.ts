/**
 * The negotiated-plan inquiry, as the platform backend accepts it at
 * `POST /v1/public/tickets/plan-inquiry` (proxied through
 * `/api/plan-inquiry`). It becomes a `plan_inquiry` ticket in the admin
 * app's queue.
 */
export interface PlanInquiryPayload {
  /** Code of an active `isCustom` plan, from `/api/plans`. */
  planCode: string;
  contactName: string;
  contactPhone: string;
  organizationName: string;
  contactEmail?: string;
  studentCount?: number;
  branchCount?: number;
  message?: string;
}

/** Same rule as the backend's: digits, optional leading `+`, spaces and
 * dashes allowed, 6–19 characters. Used as the input's `pattern` too. */
export const PHONE_PATTERN = "\\+?[0-9][0-9 \\-]{5,18}";

/** Field limits, mirrored from the backend DTO so the browser stops an
 * over-long value before the round trip does. */
export const LIMITS = {
  contactName: 200,
  contactPhone: 20,
  organizationName: 200,
  contactEmail: 100,
  message: 5000,
  /** The backend's `@Max` for each count. */
  studentCount: 1_000_000,
  branchCount: 10_000,
} as const;

/** Why a submission failed, in terms the form can phrase. */
export type InquiryError = "tooMany" | "plan" | "generic";

/** Backend error code for a plan that is not (or no longer) negotiated. */
export const PLAN_NOT_NEGOTIABLE = "PLAN_NOT_NEGOTIABLE";

import type { BrandColor } from "./colors";

/**
 * The public pricing contract, exactly as the platform backend returns it
 * from `GET /v1/public/pricing` (proxied through `/api/plans`).
 *
 * Nothing about pricing lives in this repo any more: the plans, their
 * limits and the per-term discount percentages are all maintained by staff
 * in the admin app (Plans / Discounts pages) and priced by the same backend
 * helper that issues invoices — the tenant app's own plan chooser reads
 * this very endpoint, so the advertised price and the charged price cannot
 * drift apart.
 *
 * Tögrög amounts arrive as decimal STRINGS: they're BigInt columns in the
 * backend and would lose that precision as JSON numbers. `amount()` is the
 * only place that should turn one into a number.
 */
export type Money = string | number;

/** One billing term of a plan, already priced by the backend. */
export interface ApiTerm {
  months: number;
  /** The term's discount, as set on the admin Discounts page. 0 = none. */
  discountPercentage: number;
  /** Monthly price × months, before any discount. */
  grossAmount: Money;
  discountAmount: Money;
  /** What every invoice for this term costs — the recurring price. */
  amount: Money;
  /**
   * The running campaign's share of this term, if one is running. The
   * three campaign fields are optional because an API that predates them
   * simply omits them, and a price table that breaks on a missing discount
   * would be worse than one that quietly shows the standing price.
   */
  campaignDiscountPercentage?: number;
  campaignDiscountAmount?: Money;
  /** What the FIRST invoice costs with the campaign applied. */
  firstInvoiceAmount?: Money;
}

/**
 * A promotion running for every tenant — the admin app's "Кампанит ажил"
 * with Байгууллага = Бүгд. Campaigns aimed at named tenants are never
 * published, so anything here applies to whoever is reading the page.
 *
 * It is an offer, not a certainty: the tenant activates it themselves after
 * signing up, and it is one-time per tenant, which is why it prices the
 * first invoice only and never `ApiTerm.amount`.
 */
export interface ApiCampaign {
  name: string;
  discountPercentage: number;
  /** Last day it runs, YYYY-MM-DD. */
  endDate: string;
}

export interface ApiPlan {
  /** Stable public identifier — what a signup deep link carries, since plan
   * ids are uuids generated per environment. */
  code: string;
  name: string;
  /** Null when the plan is priced by negotiation — show "contact us". */
  monthlyPrice: Money | null;
  isCustom: boolean;
  maxStudents: number;
  maxBranches: number;
  maxEmployees: number;
  /** Megabytes. Not shown on this page, but part of the payload. */
  maxStorage?: number;
  /** Empty on a custom plan: there is no list price to put a term against. */
  terms: ApiTerm[];
}

export interface PricingApiResponse {
  plans: ApiPlan[];
  /** Absent on an API that predates campaign publishing; null when none runs. */
  campaign?: ApiCampaign | null;
}

export function amount(value: Money): number {
  return Number(value);
}

/**
 * Display order. The endpoint returns plans in no particular order, and
 * there is no `order` column behind it — cheapest-first with the
 * "talk to us" tier last is the order a price table is read in anyway.
 */
export function sortPlans(plans: ApiPlan[]): ApiPlan[] {
  return [...plans].sort((a, b) => {
    if (a.isCustom !== b.isCustom) return a.isCustom ? 1 : -1;
    return amount(a.monthlyPrice ?? 0) - amount(b.monthlyPrice ?? 0);
  });
}

/**
 * The billing-period toggle is built from whatever terms the backend
 * offers, not from a list kept here: an admin adding or retiring a term
 * (1 / 3 / 12 months today) has to change what this page shows without a
 * deploy. Custom plans carry no terms, so they never contribute one.
 */
export function offeredTerms(plans: ApiPlan[]): number[] {
  const months = new Set(
    plans.filter((p) => !p.isCustom).flatMap((p) => p.terms.map((t) => t.months)),
  );
  return [...months].sort((a, b) => a - b);
}

/** Only the round numbers get a name of their own; anything else an admin
 * configures still renders sensibly as "N сар". */
export function termLabel(months: number): string {
  if (months === 1) return "Сар";
  if (months === 12) return "Жил";
  return `${months} сар`;
}

export function termFor(plan: ApiPlan, months: number): ApiTerm | undefined {
  return plan.terms.find((t) => t.months === months) ?? plan.terms[0];
}

/**
 * The discount advertised on a term's toggle button. The term discount is
 * one percentage applied to every plan, so the highest one on offer for
 * that term is that percentage — `max` is just defensiveness against a
 * plan somehow carrying a different rate.
 */
export function termDiscount(plans: ApiPlan[], months: number): number {
  return Math.max(
    0,
    ...plans.flatMap((p) => p.terms.filter((t) => t.months === months).map((t) => t.discountPercentage)),
  );
}

/**
 * What this term costs on a first invoice if the visitor activates the
 * running campaign, or null when none applies to it — including when the
 * backend is an older build that doesn't publish campaigns at all.
 *
 * The percentage is the campaign's share AS APPLIED: the backend caps the
 * two discounts together at 100% and trims the campaign, not the standing
 * term rate, so this can be smaller than the campaign's headline figure.
 */
export function campaignPrice(term: ApiTerm): { amount: number; percent: number } | null {
  const percent = term.campaignDiscountPercentage ?? 0;
  if (percent <= 0 || term.firstInvoiceAmount == null) return null;
  return { amount: amount(term.firstInvoiceAmount), percent };
}

/** `2026-09-30` → `2026.09.30`, the way dates are written in Mongolian. */
export function formatDate(isoDate: string): string {
  return isoDate.slice(0, 10).replaceAll("-", ".");
}

/**
 * The API describes what a plan costs and includes, not how to style it.
 * Colors cycle blue/purple/orange by sorted position so this keeps working
 * regardless of how many plans the backend returns; "best" only ever lands
 * on the 3rd fixed-price plan (today: Professional) and never on the
 * custom/"talk to us" tier.
 */
export function planPresentation(sortedIndex: number, isCustom: boolean) {
  const colors: BrandColor[] = ["blue", "purple", "orange"];
  const color = colors[sortedIndex % colors.length];
  const best = !isCustom && sortedIndex === 2;
  return {
    color,
    best,
    // The custom tier has no fixed price to make it stand out, so it gets
    // its own highlight instead — the brand gradient itself, rather than
    // "best"'s solid ring, so the two don't compete for the same signal.
    special: isCustom,
    flag: best ? "Түгээмэл" : isCustom ? "Тусгай санал" : undefined,
    cta: isCustom ? "Ярилцах" : "Эхлэх",
    ctaVariant: (best ? "pri" : "sec") as "pri" | "sec",
  };
}

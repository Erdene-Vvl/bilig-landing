import type { BrandColor } from "./colors";

/** One plan's numbers, as `GET /public/plans` (proxied through
 * `/api/plans`) returns them. Everything about how a plan looks
 * (color, the "most popular" ribbon, the CTA verb) is a front-end
 * decision — see `planPresentation` — not part of this shape. */
export interface ApiPlan {
  title: string;
  order: number;
  /** Absolute price, not a percentage; 0 means "no discount" — show
   * `base_price` plain, with no strikethrough. */
  discounted_price: number;
  base_price: number;
  student_count: number;
  teacher_count: number;
  branch_count: number;
  plan_id: number;
  is_unlimited: boolean;
}

export interface PlansApiResponse {
  month1: { plans: ApiPlan[] };
  month3: { plans: ApiPlan[] };
  month12: { plans: ApiPlan[] };
}

/** The three billing-period tabs. The API only supplies prices per period
 * key — these labels and the `months` count used for the tenant signup
 * deep link are a front-end concern. */
export const BILLING_PERIODS = [
  { key: "month1", months: 1, label: "Сар" },
  { key: "month3", months: 3, label: "3 сар" },
  { key: "month12", months: 12, label: "Жил" },
] as const satisfies { key: keyof PlansApiResponse; months: number; label: string }[];

export type BillingPeriodKey = (typeof BILLING_PERIODS)[number]["key"];

/**
 * The API describes what a plan costs and includes, not how to style it.
 * Colors cycle blue/purple/orange by sorted position so this keeps working
 * regardless of how many plans or what order the backend returns; "best"
 * only ever lands on the 3rd non-unlimited plan (today: Professional) and
 * never on the unlimited/"talk to us" tier.
 */
export function planPresentation(sortedIndex: number, isUnlimited: boolean) {
  const colors: BrandColor[] = ["blue", "purple", "orange"];
  const color = colors[sortedIndex % colors.length];
  const best = !isUnlimited && sortedIndex === 2;
  return {
    color,
    best,
    flag: best ? "Түгээмэл" : undefined,
    cta: isUnlimited ? "Ярилцах" : "Эхлэх",
    ctaVariant: (best ? "pri" : "sec") as "pri" | "sec",
  };
}

/**
 * Stand-in for the real pricing backend, which doesn't exist yet
 * (`BACKEND_URL` is unset in every environment right now). `/api/plans`
 * serves this whenever it can't reach a real backend, so the site shows
 * real-looking pricing today and switches to the genuine article
 * automatically the moment `BACKEND_URL` is set and reachable — no
 * frontend code changes needed at that point.
 *
 * discounted_price mirrors base_price minus a flat 5% (month3) / 15%
 * (month12) placeholder discount, same numbers already shown to users
 * before this went API-shaped; Unlimited's numeric fields are unused by
 * the UI (is_unlimited: true hides them) but still need *some* value to
 * satisfy the type.
 */
export const DEMO_PLANS: PlansApiResponse = {
  month1: {
    plans: [
      { title: "Starter", order: 1, base_price: 99000, discounted_price: 0, student_count: 50, teacher_count: 3, branch_count: 1, plan_id: 1, is_unlimited: false },
      { title: "Standard", order: 2, base_price: 199000, discounted_price: 0, student_count: 200, teacher_count: 10, branch_count: 2, plan_id: 2, is_unlimited: false },
      { title: "Professional", order: 3, base_price: 299000, discounted_price: 0, student_count: 600, teacher_count: 25, branch_count: 3, plan_id: 3, is_unlimited: false },
      { title: "Unlimited", order: 4, base_price: 0, discounted_price: 0, student_count: 0, teacher_count: 0, branch_count: 0, plan_id: 0, is_unlimited: true },
    ],
  },
  month3: {
    plans: [
      { title: "Starter", order: 1, base_price: 297000, discounted_price: 282150, student_count: 50, teacher_count: 3, branch_count: 1, plan_id: 1, is_unlimited: false },
      { title: "Standard", order: 2, base_price: 597000, discounted_price: 567150, student_count: 200, teacher_count: 10, branch_count: 2, plan_id: 2, is_unlimited: false },
      { title: "Professional", order: 3, base_price: 897000, discounted_price: 852150, student_count: 600, teacher_count: 25, branch_count: 3, plan_id: 3, is_unlimited: false },
      { title: "Unlimited", order: 4, base_price: 0, discounted_price: 0, student_count: 0, teacher_count: 0, branch_count: 0, plan_id: 0, is_unlimited: true },
    ],
  },
  month12: {
    plans: [
      { title: "Starter", order: 1, base_price: 1188000, discounted_price: 1009800, student_count: 50, teacher_count: 3, branch_count: 1, plan_id: 1, is_unlimited: false },
      { title: "Standard", order: 2, base_price: 2388000, discounted_price: 2029800, student_count: 200, teacher_count: 10, branch_count: 2, plan_id: 2, is_unlimited: false },
      { title: "Professional", order: 3, base_price: 3588000, discounted_price: 3049800, student_count: 600, teacher_count: 25, branch_count: 3, plan_id: 3, is_unlimited: false },
      { title: "Unlimited", order: 4, base_price: 0, discounted_price: 0, student_count: 0, teacher_count: 0, branch_count: 0, plan_id: 0, is_unlimited: true },
    ],
  },
};

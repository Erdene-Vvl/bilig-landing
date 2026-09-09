import type { BillingPeriod, PricingPlan } from "@/data/content";
import { Button } from "@/components/ui/Button";
import { textColor } from "@/lib/colors";
import { renderMoney, formatTugrik } from "@/lib/money";

export function PlanCard({
  plan,
  period,
  tenantUrl,
}: {
  plan: PricingPlan;
  period: BillingPeriod;
  tenantUrl: string;
}) {
  const fullPrice = plan.monthlyPrice * period.months;
  const discountedPrice = fullPrice * (1 - period.discountPct / 100);
  const hasDiscount = period.discountPct > 0;

  // Plans with a fixed self-serve price deep-link straight into the tenant
  // app's signup for that plan + period; Unlimited (no planId) goes to its
  // general sales flow instead.
  const href = plan.planId ? `${tenantUrl}/auth?planid=${plan.planId}&month=${period.months}` : tenantUrl;

  return (
    <div className={`c-plan p-6 px-[24px] py-[28px] ${plan.best ? "c-plan--best" : ""}`}>
      {plan.flag ? <span className="c-plan__flag">{plan.flag}</span> : null}
      <div className="font-display text-[16.5px] font-semibold">{plan.name}</div>

      <div className="mt-3 mb-0.5 flex flex-wrap items-baseline gap-2">
        {hasDiscount ? (
          <span className="font-display text-[15px] font-medium text-txt-3 line-through">
            {renderMoney(formatTugrik(fullPrice))}
          </span>
        ) : null}
        <span className={`font-display text-[29px] font-bold tracking-[-0.04em] ${textColor[plan.color]}`}>
          {renderMoney(formatTugrik(discountedPrice))}
        </span>
      </div>
      <div className="font-mono-brand text-[11.5px] text-txt-2">{period.unit}</div>

      <ul className="c-plan__list my-5 list-none p-0 text-[14.5px] text-txt-2">
        <li>
          Сурагч <b className="font-semibold text-txt">{plan.students}</b>
        </li>
        <li>
          Багш <b className="font-semibold text-txt">{plan.teachers}</b>
        </li>
        <li>
          Салбар <b className="font-semibold text-txt">{plan.branches}</b>
        </li>
      </ul>

      <Button
        href={href}
        variant={plan.ctaVariant === "pri" ? "pri" : "sec"}
        className="w-full"
        target="_blank"
        rel="noopener noreferrer"
      >
        {plan.cta}
      </Button>
    </div>
  );
}

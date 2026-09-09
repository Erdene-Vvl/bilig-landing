import { Button } from "@/components/ui/Button";
import { textColor } from "@/lib/colors";
import { renderMoney, formatTugrik } from "@/lib/money";
import { planPresentation, type ApiPlan } from "@/lib/plans";

export function PlanCard({
  plan,
  months,
  sortedIndex,
  tenantUrl,
}: {
  plan: ApiPlan;
  months: number;
  sortedIndex: number;
  tenantUrl: string;
}) {
  const { color, best, flag, cta, ctaVariant } = planPresentation(sortedIndex, plan.is_unlimited);
  const hasDiscount = plan.discounted_price > 0;

  // Plans with a fixed self-serve price deep-link straight into the tenant
  // app's signup for that plan + period; Unlimited (no fixed price) goes
  // to its general sales flow instead.
  const href = plan.is_unlimited ? tenantUrl : `${tenantUrl}/auth?planid=${plan.plan_id}&month=${months}`;

  return (
    <div className={`c-plan p-6 px-[24px] py-[28px] ${best ? "c-plan--best" : ""}`}>
      {flag ? <span className="c-plan__flag">{flag}</span> : null}
      <div className="font-display text-[16.5px] font-semibold">{plan.title}</div>

      {/* Unlimited has no price to show at all — not even a struck-through
          one — so this row just doesn't render for it. .c-plan's column
          flex + .c-plan__list's flex:1 keep every card's CTA aligned
          regardless of which rows are present. */}
      {plan.is_unlimited ? null : (
        <div className="mt-3 mb-5 flex flex-wrap items-baseline gap-2">
          {hasDiscount ? (
            <span className="font-display text-[15px] font-medium text-txt-3 line-through">
              {renderMoney(formatTugrik(plan.base_price))}
            </span>
          ) : null}
          <span className={`font-display text-[29px] font-bold tracking-[-0.04em] ${textColor[color]}`}>
            {renderMoney(formatTugrik(hasDiscount ? plan.discounted_price : plan.base_price))}
          </span>
        </div>
      )}

      <ul className={`c-plan__list list-none p-0 text-[14.5px] text-txt-2 ${plan.is_unlimited ? "mt-3 mb-5" : "my-5"}`}>
        <li>
          Сурагч{" "}
          <b className={`font-semibold ${plan.is_unlimited ? `font-display text-[17px] ${textColor[color]}` : "text-txt"}`}>
            {plan.is_unlimited ? "∞" : plan.student_count}
          </b>
        </li>
        <li>
          Багш{" "}
          <b className={`font-semibold ${plan.is_unlimited ? `font-display text-[17px] ${textColor[color]}` : "text-txt"}`}>
            {plan.is_unlimited ? "∞" : plan.teacher_count}
          </b>
        </li>
        <li>
          Салбар{" "}
          <b className={`font-semibold ${plan.is_unlimited ? `font-display text-[17px] ${textColor[color]}` : "text-txt"}`}>
            {plan.is_unlimited ? "∞" : plan.branch_count}
          </b>
        </li>
      </ul>

      <Button href={href} variant={ctaVariant} className="w-full" target="_blank" rel="noopener noreferrer">
        {cta}
      </Button>
    </div>
  );
}

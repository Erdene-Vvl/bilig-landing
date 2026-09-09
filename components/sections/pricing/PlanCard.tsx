import type { PricingPlan } from "@/data/content";
import { Button } from "@/components/ui/Button";
import { textColor } from "@/lib/colors";
import { renderMoney } from "@/lib/money";

export function PlanCard({ plan, yearly, tenantUrl }: { plan: PricingPlan; yearly: boolean; tenantUrl: string }) {
  return (
    <div className={`c-plan p-6 px-[24px] py-[28px] ${plan.best ? "c-plan--best" : ""}`}>
      {plan.flag ? <span className="c-plan__flag">{plan.flag}</span> : null}
      <div className="font-display text-[16.5px] font-semibold">{plan.name}</div>
      <div className={`font-display mt-3 mb-0.5 text-[29px] font-bold tracking-[-0.04em] ${textColor[plan.color]}`}>
        {renderMoney(yearly ? plan.yearly : plan.monthly)}
      </div>
      <div className="font-mono-brand text-[11.5px] text-txt-2">{yearly ? "жилд" : "сар тутам"}</div>

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
        href={tenantUrl}
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

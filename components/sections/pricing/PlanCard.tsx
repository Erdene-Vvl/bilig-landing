import { Button } from "@/components/ui/Button";
import { textColor } from "@/lib/colors";
import { renderMoney, formatTugrik } from "@/lib/money";
import { amount, campaignPrice, planPresentation, termFor, type ApiPlan } from "@/lib/plans";

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
  const { color, best, special, flag, cta, ctaVariant } = planPresentation(sortedIndex, plan.isCustom);
  const term = termFor(plan, months);
  const discount = term?.discountPercentage ?? 0;
  // A running all-tenants campaign prices the FIRST invoice only, so it
  // takes over the headline figure and pushes the recurring price into the
  // line below — never the other way round, or the page would quote a
  // renewal at a one-time rate.
  const promo = term ? campaignPrice(term) : null;
  const headline = promo ? promo.amount : term ? amount(term.amount) : 0;
  const offPercent = discount + (promo?.percent ?? 0);

  // Plans with a fixed list price deep-link straight into the tenant app's
  // signup for that plan + term; the custom tier (no fixed price) goes to
  // its general sales flow instead. `plan`/`term` — not the plan's uuid,
  // which is generated per environment — is what the tenant app's
  // `lib/auth/plan-selection.ts` accepts.
  const href = plan.isCustom
    ? tenantUrl
    : `${tenantUrl}/auth?plan=${encodeURIComponent(plan.code)}&term=${term?.months ?? months}`;

  return (
    <div
      className={`c-plan p-6 px-[24px] py-[28px] ${best ? "c-plan--best" : ""} ${special ? "c-plan--special" : ""}`}
    >
      {flag ? <span className={`c-plan__flag ${special ? "c-plan__flag--special" : ""}`}>{flag}</span> : null}
      <div className="font-display text-[16.5px] font-semibold">{plan.name}</div>

      {/* The custom tier has no price to show at all — not even a
          struck-through one — a tagline fills that space instead. .c-plan's
          column flex + .c-plan__list's flex:1 keep every card's CTA aligned
          regardless of which rows are present. */}
      {plan.isCustom || !term ? (
        <p className="c-band-text mt-3 mb-5 max-w-[24ch] text-[15px] font-semibold leading-snug">
          Байгууллагад тохирсон нөхцөл санал болгоно
        </p>
      ) : (
        <div className="mt-3 mb-5">
          {/* Struck-through list price and the percentage off share one row
              above the figure they qualify, rather than trailing it: on a
              narrow card a trailing badge wraps to its own line and leaves
              this card taller than its siblings. */}
          {offPercent > 0 ? (
            <div className="mb-0.5 flex flex-wrap items-center gap-2">
              <span className="font-display text-[15px] font-medium text-txt-3 line-through">
                {renderMoney(formatTugrik(amount(term.grossAmount)))}
              </span>
              {/* One combined percentage, not two badges: both discounts come
                  off the same gross (the backend adds the rates, it doesn't
                  compound them), so their sum is the honest figure and the
                  banner above the grid is where the campaign is named. */}
              <span className="c-plan__save">−{offPercent}%</span>
            </div>
          ) : null}
          <div className={`font-display text-[29px] font-bold tracking-[-0.04em] ${textColor[color]}`}>
            {renderMoney(formatTugrik(headline))}
          </div>
          {/* A multi-month term's headline figure covers the whole term, so
              the per-month rate is what makes it comparable to the others. */}
          {term.months > 1 ? (
            <p className="mt-1.5 text-[13px] text-txt-2">
              сард {renderMoney(formatTugrik(headline / term.months))}
              {!promo && discount > 0 ? ` · ${formatTugrik(amount(term.discountAmount))} хэмнэнэ` : ""}
            </p>
          ) : null}
          {/* The one thing this card must not leave unsaid: the campaign is
              spent on the first invoice, and every renewal after it costs
              the standing term price. */}
          {promo ? (
            <p className="mt-1 text-[13px] text-txt-2">
              эхний төлбөрт · дараа нь {renderMoney(formatTugrik(amount(term.amount)))}
            </p>
          ) : null}
        </div>
      )}

      <ul className="c-plan__list mb-5 list-none p-0 text-[14.5px] text-txt-2">
        <li>
          Сурагч{" "}
          <b className={`font-semibold ${plan.isCustom ? `font-display text-[17px] ${textColor[color]}` : "text-txt"}`}>
            {plan.isCustom ? "∞" : plan.maxStudents}
          </b>
        </li>
        <li>
          Хэрэглэгч{" "}
          <b className={`font-semibold ${plan.isCustom ? `font-display text-[17px] ${textColor[color]}` : "text-txt"}`}>
            {plan.isCustom ? "∞" : plan.maxEmployees}
          </b>
        </li>
        <li>
          Салбар{" "}
          <b className={`font-semibold ${plan.isCustom ? `font-display text-[17px] ${textColor[color]}` : "text-txt"}`}>
            {plan.isCustom ? "∞" : plan.maxBranches}
          </b>
        </li>
      </ul>

      <Button href={href} variant={ctaVariant} className="w-full" target="_blank" rel="noopener noreferrer">
        {cta}
      </Button>
    </div>
  );
}

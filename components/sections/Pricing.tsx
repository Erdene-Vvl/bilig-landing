"use client";

import { useEffect, useState } from "react";
import { pricing } from "@/data/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { renderEmphasis } from "@/lib/emphasis";
import { Reveal } from "@/components/ui/Reveal";
import {
  formatDate,
  offeredTerms,
  sortPlans,
  termDiscount,
  termLabel,
  type ApiCampaign,
  type ApiPlan,
  type PricingApiResponse,
} from "@/lib/plans";
import { PlanCard } from "./pricing/PlanCard";

/** `tenantUrl` is a server-only env value (see lib/env.ts) — this
 * component is a client component (for the billing-term toggle state),
 * so it can't read that env var itself; the server-rendered parent hands
 * it down as a plain prop instead. */
export function Pricing({ tenantUrl }: { tenantUrl: string }) {
  const [plans, setPlans] = useState<ApiPlan[] | null>(null);
  const [campaign, setCampaign] = useState<ApiCampaign | null>(null);
  const [failed, setFailed] = useState(false);
  // Null until the plans arrive: which terms exist is the backend's answer,
  // not something this component can assume ahead of the fetch.
  const [months, setMonths] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/plans")
      .then((res) => (res.ok ? (res.json() as Promise<PricingApiResponse>) : Promise.reject()))
      .then((json) => {
        if (cancelled) return;
        const sorted = sortPlans(json.plans);
        setPlans(sorted);
        setCampaign(json.campaign ?? null);
        setMonths(offeredTerms(sorted)[0] ?? 1);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const terms = plans ? offeredTerms(plans) : [];

  return (
    <section className="sec bg-s" id="une">
      <div className="wrap">
        <Reveal>
          <SectionHeading eyebrow={pricing.eyebrow} title={pricing.title} lede={pricing.lede} center>
            {terms.length > 1 ? (
              <div className="c-toggle" role="group" aria-label="Төлбөрийн давтамж">
                {terms.map((option) => {
                  // The term discount is the same percentage for every plan,
                  // so it belongs on the toggle — that's where the choice
                  // between terms is actually made.
                  const off = plans ? termDiscount(plans, option) : 0;
                  return (
                    <button
                      key={option}
                      aria-pressed={option === months}
                      onClick={() => setMonths(option)}
                    >
                      {termLabel(option)}
                      {off > 0 ? <span className="c-toggle__save">−{off}%</span> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </SectionHeading>
        </Reveal>

        {campaign ? (
          <Reveal>
            {/* Named once for the whole section rather than on all four
                cards: the cards carry the numbers, and the campaign is the
                same offer behind every one of them. */}
            <p className="c-promo mt-[26px]">
              <b>{campaign.name}</b> — нэмэлт {campaign.discountPercentage}% хямдрал,{" "}
              {formatDate(campaign.endDate)} хүртэл. Бүртгүүлээд эхний төлбөртөө ашиглана.
            </p>
          </Reveal>
        ) : null}

        <Reveal>
          {/* No items-start here on purpose: cards stretch to match the
              tallest one in their row (see .c-plan's column flex), so the
              custom tier's shorter content doesn't leave it squat next
              to its siblings. */}
          <div className={`${campaign ? "mt-[18px]" : "mt-[38px]"} grid grid-cols-1 gap-[14px] min-[560px]:grid-cols-2 min-[980px]:grid-cols-4`}>
            {failed ? (
              <p className="col-span-full text-center text-txt-2">Үнийн мэдээлэл ачаалж чадсангүй.</p>
            ) : plans && months !== null ? (
              plans.map((plan, i) => (
                <PlanCard key={plan.code} plan={plan} months={months} sortedIndex={i} tenantUrl={tenantUrl} />
              ))
            ) : (
              <p className="col-span-full text-center text-txt-2">Ачааллаж байна…</p>
            )}
          </div>
        </Reveal>

        <p className="mt-[22px] text-center text-[14.5px] text-txt-2">
          {renderEmphasis(pricing.note, "c-em font-semibold")}
        </p>
      </div>
    </section>
  );
}

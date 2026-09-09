"use client";

import { useEffect, useState } from "react";
import { pricing } from "@/data/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { BILLING_PERIODS, type PlansApiResponse } from "@/lib/plans";
import { PlanCard } from "./pricing/PlanCard";

/** `tenantUrl` is a server-only env value (see lib/env.ts) — this
 * component is a client component (for the billing-period toggle state),
 * so it can't read that env var itself; the server-rendered parent hands
 * it down as a plain prop instead. */
export function Pricing({ tenantUrl }: { tenantUrl: string }) {
  const [periodIndex, setPeriodIndex] = useState(0);
  const [data, setData] = useState<PlansApiResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/plans")
      .then((res) => (res.ok ? (res.json() as Promise<PlansApiResponse>) : Promise.reject()))
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const period = BILLING_PERIODS[periodIndex];
  const plans = data ? [...data[period.key].plans].sort((a, b) => a.order - b.order) : null;

  return (
    <section className="sec bg-s" id="une">
      <div className="wrap">
        <Reveal>
          <SectionHeading eyebrow={pricing.eyebrow} title={pricing.title} lede={pricing.lede} center>
            <div className="c-toggle" role="group" aria-label="Төлбөрийн давтамж">
              {BILLING_PERIODS.map((p, i) => (
                <button key={p.key} aria-pressed={i === periodIndex} onClick={() => setPeriodIndex(i)}>
                  {p.label}
                </button>
              ))}
            </div>
          </SectionHeading>
        </Reveal>

        <Reveal>
          {/* No items-start here on purpose: cards stretch to match the
              tallest one in their row (see .c-plan's column flex), so the
              Unlimited card's shorter content doesn't leave it squat next
              to its siblings. */}
          <div className="mt-[38px] grid grid-cols-1 gap-[14px] min-[560px]:grid-cols-2 min-[980px]:grid-cols-4">
            {failed ? (
              <p className="col-span-full text-center text-txt-2">Үнийн мэдээлэл ачаалж чадсангүй.</p>
            ) : plans ? (
              plans.map((plan, i) => (
                <PlanCard key={plan.plan_id} plan={plan} months={period.months} sortedIndex={i} tenantUrl={tenantUrl} />
              ))
            ) : (
              <p className="col-span-full text-center text-txt-2">Ачааллаж байна…</p>
            )}
          </div>
        </Reveal>

        <p className="mt-[22px] text-center text-[14.5px] text-txt-2">{pricing.note}</p>
      </div>
    </section>
  );
}

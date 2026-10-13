"use client";

import { useState, type FormEvent } from "react";
import { planInquiry } from "@/data/content";
import { Arc } from "@/components/ui/Arc";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { renderEmphasis } from "@/lib/emphasis";
import { LIMITS, PHONE_PATTERN, PLAN_NOT_NEGOTIABLE, type InquiryError } from "@/lib/plan-inquiry";
import type { ApiPlan } from "@/lib/plans";

/** This form's in-page anchor (the "Ярилцах" button targets the contact section). */
const PLAN_INQUIRY_ANCHOR = "yariltsah";

type Status = "idle" | "sending" | "sent";

const { fields } = planInquiry;

/**
 * "Talk to us" for the negotiated plan: a contact form under the price
 * table that files a plan-inquiry ticket in the admin app's queue (through
 * `/api/plan-inquiry`). Laid out like the page's other closing card — copy
 * on the left, form on the right, the brand arc behind.
 *
 * Rendered only when the backend offers a custom plan; with more than one,
 * the visitor picks which.
 */
export function PlanInquiry({ plans }: { plans: ApiPlan[] }) {
  const [planCode, setPlanCode] = useState(plans[0]?.code ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<InquiryError | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/plan-inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), planCode }),
      });
      if (res.ok) {
        form.reset();
        setStatus("sent");
        return;
      }
      const body = (await res.json().catch(() => null)) as { code?: string } | null;
      setError(res.status === 429 ? "tooMany" : body?.code === PLAN_NOT_NEGOTIABLE ? "plan" : "generic");
    } catch {
      setError("generic");
    }
    setStatus("idle");
  }

  return (
    <div
      id={PLAN_INQUIRY_ANCHOR}
      className="c-cta-card relative mt-[46px] scroll-mt-24 overflow-hidden p-[clamp(30px,4vw,48px)]"
    >
      <Arc variant="bl" opacity={0.3} style={{ bottom: -150, left: -100 }} />

      <div className="relative grid items-start gap-7 min-[840px]:grid-cols-[1fr_.95fr] min-[840px]:gap-[clamp(28px,4vw,54px)]">
        <div>
          <Eyebrow>{planInquiry.eyebrow}</Eyebrow>
          <h2 className="font-display text-[clamp(24px,3vw,34px)] font-semibold leading-[1.12] tracking-[-0.028em]">
            {renderEmphasis(planInquiry.title)}
          </h2>
          <p className="mt-[18px] max-w-[56ch] text-[17px] font-light leading-[1.6] text-txt-2">{planInquiry.lede}</p>
        </div>

        {status === "sent" ? (
          <div role="status" className="flex flex-col items-start">
            {/* The brand gradient, as on the custom plan's flag: this is
                the end of that card's story. */}
            <span
              aria-hidden="true"
              className="mb-5 flex size-14 items-center justify-center rounded-full text-white"
              style={{ background: "var(--band)" }}
            >
              <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={2.4}>
                <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h3 className="font-display text-[clamp(21px,2.4vw,26px)] font-semibold leading-[1.2] tracking-[-0.02em]">
              {renderEmphasis(planInquiry.successTitle)}
            </h3>
            <p className="mt-[12px] max-w-[46ch] text-[15.5px] leading-[1.6] text-txt-2">{planInquiry.successBody}</p>
            <Button type="button" variant="sec" size="sm" className="mt-5" onClick={() => setStatus("idle")}>
              {planInquiry.again}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {plans.length > 1 ? (
              <div className="c-field mb-[14px]">
                <label htmlFor="pi-plan">{planInquiry.planLabel}</label>
                <select id="pi-plan" value={planCode} onChange={(e) => setPlanCode(e.target.value)}>
                  {plans.map((plan) => (
                    <option key={plan.code} value={plan.code}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <Field id="contactName" required maxLength={LIMITS.contactName} autoComplete="name" />
            <Field
              id="contactPhone"
              type="tel"
              required
              maxLength={LIMITS.contactPhone}
              pattern={PHONE_PATTERN}
              title={planInquiry.errors.phone}
              autoComplete="tel"
            />
            <Field
              id="organizationName"
              required
              maxLength={LIMITS.organizationName}
              autoComplete="organization"
            />
            <Field id="contactEmail" type="email" maxLength={LIMITS.contactEmail} autoComplete="email" />

            <div className="grid grid-cols-2 gap-[14px]">
              <Field id="studentCount" numeric maxLength={String(LIMITS.studentCount).length} />
              <Field id="branchCount" numeric maxLength={String(LIMITS.branchCount).length} />
            </div>

            <div className="c-field mb-[14px]">
              <label htmlFor="pi-message">
                {fields.message.label} <Optional />
              </label>
              <textarea
                id="pi-message"
                name="message"
                rows={3}
                maxLength={LIMITS.message}
                placeholder={fields.message.placeholder}
              />
            </div>

            {/* Honeypot: off-screen and out of the tab order, so only a bot
                fills it. The route handler drops any submission that does. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="pi-website">Website</label>
              <input id="pi-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            {error ? (
              <p role="alert" className="mb-3 text-[14px] text-danger">
                {planInquiry.errors[error]}
              </p>
            ) : null}

            <Button type="submit" variant="pri" className="mt-1.5 w-full" disabled={status === "sending"}>
              {status === "sending" ? planInquiry.sending : planInquiry.submit}
            </Button>
            <p className="mt-3 text-[12.5px] leading-[1.5] text-txt-3">{planInquiry.fine}</p>
          </form>
        )}
      </div>
    </div>
  );
}

function Optional() {
  return <span className="normal-case tracking-normal text-txt-3/80">· {planInquiry.optional}</span>;
}

/** One labelled input from the `planInquiry.fields` copy. */
function Field({
  id,
  type = "text",
  numeric = false,
  required = false,
  ...rest
}: {
  id: Exclude<keyof typeof fields, "message">;
  type?: "text" | "tel" | "email";
  numeric?: boolean;
  required?: boolean;
  maxLength?: number;
  pattern?: string;
  title?: string;
  autoComplete?: string;
}) {
  const copy = fields[id];
  return (
    <div className="c-field mb-[14px]">
      <label htmlFor={`pi-${id}`}>
        {copy.label} {required ? null : <Optional />}
      </label>
      <input
        id={`pi-${id}`}
        name={id}
        type={type}
        required={required}
        placeholder={copy.placeholder}
        {...(numeric ? { inputMode: "numeric" as const, pattern: "[0-9]*" } : {})}
        {...rest}
      />
    </div>
  );
}

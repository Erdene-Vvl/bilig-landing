"use client";

import { useEffect, useState, type FormEvent } from "react";
import { contact } from "@/data/content";
import { Button } from "@/components/ui/Button";
import { LEAD_PLAN_EVENT, type LeadPlanDetail } from "@/lib/links";

type Status = "idle" | "sending" | "sent";

/** Mongolian mobile and landline numbers, with optional +976 and spacing. */
const PHONE = /^\+?[0-9][0-9 -]{5,18}$/;

export function ContactForm({ endpoint }: { endpoint: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<LeadPlanDetail | null>(null);

  // The custom plan's "Ярилцах" button says which plan this enquiry is about.
  useEffect(() => {
    const onPlan = (event: Event) => setPlan((event as CustomEvent<LeadPlanDetail>).detail);
    window.addEventListener(LEAD_PLAN_EVENT, onPlan);
    return () => window.removeEventListener(LEAD_PLAN_EVENT, onPlan);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim();

    const name = text("name");
    const phoneNumber = text("phoneNumber");
    if (!name || !PHONE.test(phoneNumber)) {
      setError(contact.errors.invalid);
      return;
    }
    const studentCount = Number.parseInt(text("studentCount"), 10);

    setError(null);
    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          phoneNumber,
          centerName: text("centerName") || undefined,
          studentCount: Number.isFinite(studentCount) && studentCount >= 0 ? studentCount : undefined,
          planCode: plan?.code,
          message: text("message") || undefined,
          website: text("website") || undefined,
        }),
      });
      if (!res.ok) {
        setError(res.status === 429 ? contact.errors.tooMany : res.status === 400 ? contact.errors.invalid : contact.errors.failed);
        setStatus("idle");
        return;
      }
      setStatus("sent");
    } catch {
      setError(contact.errors.failed);
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div role="status">
        <h3 className="text-[20px]">{contact.successTitle}</h3>
        <p className="mt-[10px] text-[15px] text-txt-2">{contact.successBody}</p>
      </div>
    );
  }

  const { fields } = contact;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {plan ? (
        <p className="mb-[14px] flex items-center gap-2 text-[14px] text-txt-2">
          {contact.planNote} <b className="text-txt">{plan.name}</b>
          <button
            type="button"
            onClick={() => setPlan(null)}
            aria-label={contact.clearPlan}
            className="ml-1 cursor-pointer text-txt-3 hover:text-txt"
          >
            ✕
          </button>
        </p>
      ) : null}

      <div className="c-field mb-[14px]">
        <label htmlFor="lead-name">{fields.name.label}</label>
        <input id="lead-name" name="name" type="text" required maxLength={100} autoComplete="name" placeholder={fields.name.placeholder} />
      </div>
      <div className="c-field mb-[14px]">
        <label htmlFor="lead-phone">{fields.phoneNumber.label}</label>
        <input id="lead-phone" name="phoneNumber" type="tel" required maxLength={20} autoComplete="tel" placeholder={fields.phoneNumber.placeholder} />
      </div>
      <div className="c-field mb-[14px]">
        <label htmlFor="lead-center">{fields.centerName.label}</label>
        <input id="lead-center" name="centerName" type="text" maxLength={200} autoComplete="organization" placeholder={fields.centerName.placeholder} />
      </div>
      <div className="c-field mb-[14px]">
        <label htmlFor="lead-students">{fields.studentCount.label}</label>
        <input id="lead-students" name="studentCount" type="text" inputMode="numeric" maxLength={7} placeholder={fields.studentCount.placeholder} />
      </div>
      <div className="c-field mb-[14px]">
        <label htmlFor="lead-message">{fields.message.label}</label>
        <textarea id="lead-message" name="message" maxLength={2000} placeholder={fields.message.placeholder} />
      </div>

      {/* Honeypot: off-screen and out of the tab order, so only a bot fills it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="lead-website">Website</label>
        <input id="lead-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {error ? (
        <p role="alert" className="mb-3 text-[14px] text-danger">
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="pri" className="mt-1.5 w-full" disabled={status === "sending"}>
        {status === "sending" ? contact.submitting : contact.submit}
      </Button>
      <p className="mt-3 text-[12.5px] leading-[1.5] text-txt-3">{contact.fine}</p>
    </form>
  );
}

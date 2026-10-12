import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/env";
import type { PlanInquiryPayload } from "@/lib/plan-inquiry";

/**
 * Same-origin proxy in front of the backend's public plan-inquiry endpoint
 * (`POST /v1/public/tickets/plan-inquiry`), like `/api/plans` is for prices:
 * the browser never learns the backend's address.
 *
 * Two guards live here rather than in the backend, because every request
 * reaches the backend from this one server and so looks to it like a single
 * visitor:
 *
 * - a per-visitor limit, keyed on the address nginx puts last in
 *   `X-Forwarded-For` (the only entry a client cannot forge);
 * - a honeypot: the form carries a `website` field humans never see. A bot
 *   that fills it gets the same success answer, and nothing is filed.
 */

const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 3;
const attempts = new Map<string, number[]>();

function clientIp(request: Request): string {
  const chain = request.headers.get("x-forwarded-for");
  const last = chain?.split(",").pop()?.trim();
  return last || request.headers.get("x-real-ip") || "unknown";
}

/** True when this visitor may send one more. Old entries age out on use. */
function allow(ip: string, now = Date.now()): boolean {
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  attempts.set(ip, recent);
  // Keep the map from growing without bound on a long-lived server.
  if (attempts.size > 5_000) {
    for (const [key, times] of attempts) {
      if (times.every((t) => now - t >= WINDOW_MS)) attempts.delete(key);
    }
  }
  return recent.length < MAX_PER_WINDOW;
}

/**
 * Counts one filed inquiry against the visitor. Only successes count: a
 * visitor whose submission the backend refused (a typo in the e-mail, say)
 * must be able to correct it without being locked out for ten minutes.
 */
function record(ip: string, now = Date.now()): void {
  attempts.set(ip, [...(attempts.get(ip) ?? []), now]);
}

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const optionalText = (value: unknown) => text(value) || undefined;
/**
 * Plain digits only: `Number()` would also take "1e3" and "0x1A", and turn
 * "abc" into NaN — which serializes to `null` and slips past the backend's
 * `@IsOptional`. Anything else is dropped rather than sent.
 */
const optionalCount = (value: unknown) => {
  const raw = typeof value === "number" ? String(value) : text(value);
  return /^\d{1,7}$/.test(raw) ? Number(raw) : undefined;
};

/**
 * Only the fields the backend declares — it rejects anything else with a
 * 400 — so the honeypot and any stray key never reach it.
 */
function toPayload(body: Record<string, unknown>): PlanInquiryPayload {
  return {
    planCode: text(body.planCode),
    contactName: text(body.contactName),
    contactPhone: text(body.contactPhone),
    organizationName: text(body.organizationName),
    contactEmail: optionalText(body.contactEmail),
    studentCount: optionalCount(body.studentCount),
    branchCount: optionalCount(body.branchCount),
    message: optionalText(body.message),
  };
}

export async function POST(request: Request) {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  // `null`, an array or a bare value is valid JSON but not a form.
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const body = parsed as Record<string, unknown>;

  if (text(body.website)) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const ip = clientIp(request);
  if (!allow(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const res = await fetch(`${backendUrl}/v1/public/tickets/plan-inquiry`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(toPayload(body)),
    });
    if (res.ok) {
      record(ip);
      return NextResponse.json({ ok: true }, { status: 201 });
    }
    // The visitor's own mistakes (400) and rate limits (429) keep their
    // status and error code — the form has copy for each. Anything else is
    // the backend failing, which reads to the visitor as one generic 502,
    // as `/api/plans` does. Never the backend's message text.
    const error = (await res.json().catch(() => null)) as { code?: string } | null;
    const status = res.status === 400 || res.status === 429 ? res.status : 502;
    return NextResponse.json({ code: error?.code }, { status });
  } catch {
    return NextResponse.json({ error: "Inquiry backend unreachable" }, { status: 502 });
  }
}

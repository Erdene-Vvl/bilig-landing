import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/env";

/**
 * Same-origin proxy in front of the platform backend's public pricing
 * endpoint (`GET /v1/public/pricing`) — the same list the tenant app's plan
 * chooser reads, maintained by staff on the admin app's Plans and Discounts
 * pages.
 *
 * There is deliberately no local fallback: pricing that is merely
 * plausible is worse than none, because a visitor who acts on a figure this
 * page invented would meet a different one at checkout. When the backend
 * can't be reached the section says so instead (see `Pricing`).
 *
 * Also keeps `BACKEND_URL` server-only (never shipped to client JS) and
 * gives the frontend a stable path regardless of the backend's own address.
 *
 * Runs on every request (no caching) — this is exactly the kind of data,
 * prices and discounts, that must not go stale behind a build.
 */
export async function GET() {
  try {
    const res = await fetch(`${backendUrl}/v1/public/pricing`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: `Pricing backend returned ${res.status}` }, { status: 502 });
    }
    return NextResponse.json(await res.json(), {
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Pricing backend unreachable" }, { status: 502 });
  }
}

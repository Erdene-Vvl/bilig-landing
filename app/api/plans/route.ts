import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/env";
import { DEMO_PLANS } from "@/lib/plans";

/**
 * Same-origin proxy in front of the pricing backend's public plans
 * endpoint. Falls back to DEMO_PLANS whenever it can't reach a real one
 * (backendUrl unset, network error, non-2xx) — today that's always,
 * since the backend doesn't exist yet, so real visitors see believable
 * pricing instead of a broken section. The moment `BACKEND_URL` is set
 * and reachable, this starts proxying the real thing with no frontend
 * changes needed.
 *
 * Also keeps `BACKEND_URL` server-only (never shipped to client JS) and
 * gives the frontend a stable path regardless of what the backend's own
 * URL is or how it changes.
 *
 * Runs on every request (no caching) — this is exactly the kind of data,
 * prices and discounts, that shouldn't go stale behind a build.
 */
export async function GET() {
  if (!backendUrl) {
    return NextResponse.json(DEMO_PLANS);
  }

  try {
    const res = await fetch(`${backendUrl}/public/plans`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(DEMO_PLANS);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(DEMO_PLANS);
  }
}

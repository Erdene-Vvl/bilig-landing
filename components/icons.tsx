import type { SVGProps } from "react";

/** Shared inline icon set — kept as simple stroke-based SVGs to match the
 * hand-drawn line-icon style of the original design, and to inherit color
 * via `currentColor` / Tailwind's `stroke-*` utilities. */

export function ScheduleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M3 10h18M6 3v3m12-3v3M4 6h16v14H4z" />
      <path d="M9 14h6" />
    </svg>
  );
}

/** The Mongolian tugrik sign (₮): a T-stem crossed by two short bars. */
export function TugrikIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M5 5h14M12 5v15M9 10h6M9 14h6" />
    </svg>
  );
}

export function BarsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M4 20V10m5 10V4m5 16v-7m5 7V8" />
    </svg>
  );
}

export function ChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M21 12a8 8 0 01-8 8H4l2.5-3A8 8 0 1121 12z" />
    </svg>
  );
}

export const problemIcons = {
  grid: ScheduleIcon,
  tugrik: TugrikIcon,
  bars: BarsIcon,
  chat: ChatIcon,
};

export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
    </svg>
  );
}

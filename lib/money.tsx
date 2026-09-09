import { Fragment, type ReactNode } from "react";

/** Formats a whole-tögrög amount as "1,234,567₮" — this product has no use
 * for möngö/cents, so it's always rounded to the nearest tögrög. */
export function formatTugrik(amount: number): string {
  return `${Math.round(amount).toLocaleString("en-US")}₮`;
}

/**
 * Some of the brand display faces have no glyph for ₮ (U+20AE, Mongolian
 * Tugrik), so the browser silently falls back to a system font for just
 * that character. That fallback glyph sits under a heading's negative
 * letter-spacing (tracking-normal resets it here) and, being a narrower
 * shape than the surrounding digits, reads as jammed up against its
 * neighbour without a hair of margin to separate them.
 */
export function renderMoney(text: string): ReactNode {
  const parts = text.split(/(₮)/g);
  return parts.map((part, i) =>
    part === "₮" ? (
      <span key={i} className="font-sans tracking-normal mx-1">
        ₮
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

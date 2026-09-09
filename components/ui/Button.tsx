import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "pri" | "sec" | "white";
type Size = "md" | "sm";

const variantClass: Record<Variant, string> = {
  pri: "c-btn--pri",
  sec: "c-btn--sec",
  white: "c-btn--white",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type LinkButtonProps = CommonProps & { href: string } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "className" | "href"
  >;

type NativeButtonProps = CommonProps & { href?: undefined } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className"
  >;

export type ButtonProps = LinkButtonProps | NativeButtonProps;

/** Pill-shaped CTA button. Renders a Next.js `Link` when `href` is given
 * (in-page anchors and the external tenant-app links both resolve fine
 * through it), otherwise a native `<button>` for form submits. */
export function Button({ variant = "pri", size = "md", className = "", children, href, ...rest }: ButtonProps) {
  const classes = ["c-btn", variantClass[variant], size === "sm" ? "c-btn--sm" : "", className]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

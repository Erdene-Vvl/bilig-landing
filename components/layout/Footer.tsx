import { footer } from "@/data/content";
import { CONTACT_ANCHOR } from "@/lib/links";

export function Footer() {
  // "Холбоо барих" goes to the contact form at the foot of this page — the
  // tenant app is for signing in, not for reaching the Bilig team.
  const links = [
    ...footer.links.map((l) => ({ ...l, external: false })),
    { href: `#${CONTACT_ANCHOR}`, label: "Холбоо барих", external: false },
  ];

  return (
    <footer className="border-t border-line bg-surface py-[34px] text-sm text-txt-2">
      <div className="wrap flex flex-wrap items-center justify-between gap-4">
        <span>{footer.copyright}</span>
        <span>
          {links.map((link, i) => (
            <span key={link.href + link.label}>
              <a
                href={link.href}
                className="text-txt-2 no-underline hover:text-blue"
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {link.label}
              </a>
              {i < links.length - 1 ? " | " : ""}
            </span>
          ))}
        </span>
      </div>
    </footer>
  );
}

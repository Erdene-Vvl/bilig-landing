import { footer } from "@/data/content";
import { tenantUrl } from "@/lib/env";

export function Footer() {
  // "Холбоо барих" used to anchor to the on-page lead form; with that gone,
  // it hands off to the tenant app (in a new tab) like every other CTA.
  const links = [...footer.links.map((l) => ({ ...l, external: false })), { href: tenantUrl, label: "Холбоо барих", external: true }];

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
              {i < links.length - 1 ? " · " : ""}
            </span>
          ))}
        </span>
      </div>
    </footer>
  );
}

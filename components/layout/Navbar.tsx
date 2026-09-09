import Link from "next/link";
import { nav } from "@/data/content";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BiligLogo } from "@/components/ui/BiligLogo";
import { tenantUrl, tenantDemoUrl } from "@/lib/env";

export function Navbar() {
  return (
    <nav className="c-nav">
      <div className="wrap flex h-17.5 items-center gap-7">
        <Link href="#top" aria-label={nav.brand}>
          <BiligLogo className="h-7 w-auto text-txt" />
        </Link>

        <div className="ml-auto hidden gap-6.5 text-[15px] min-[900px]:flex">
          {nav.links.map((link) => (
            <a key={link.href} href={link.href} className="c-nav-link">
              {link.label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2.5 min-[900px]:ml-5.5">
          <ThemeToggle />
          <Button
            href={tenantDemoUrl}
            variant="sec"
            size="sm"
            className="hidden min-[560px]:inline-flex"
            target="_blank"
            rel="noopener noreferrer"
          >
            Демо үзэх
          </Button>
          <Button href={tenantUrl} variant="pri" size="sm" target="_blank" rel="noopener noreferrer">
            Үнэгүй турших
          </Button>
        </div>
      </div>
    </nav>
  );
}

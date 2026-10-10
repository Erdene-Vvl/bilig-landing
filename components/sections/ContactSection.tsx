import { contact } from "@/data/content";
import { Arc } from "@/components/ui/Arc";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { renderEmphasis } from "@/lib/emphasis";
import { CONTACT_ANCHOR } from "@/lib/links";
import { ContactForm } from "./contact/ContactForm";

/**
 * Where "Ярилцах" (the custom plan) and "Холбоо барих" (footer) lead: a
 * real lead form, posted to the backend's `POST /v1/public/leads`.
 *
 * `leadsEndpoint` is built from a server-only env value (see lib/env.ts),
 * so the server-rendered page hands it down as a prop.
 */
export function ContactSection({ leadsEndpoint }: { leadsEndpoint: string }) {
  return (
    <section className="pt-[clamp(48px,6vw,80px)] pb-[clamp(60px,7vw,96px)]" id={CONTACT_ANCHOR}>
      <div className="wrap">
        <Reveal>
          <div className="c-cta-card relative overflow-hidden p-[clamp(30px,4vw,48px)]">
            <Arc variant="bl" opacity={0.3} style={{ bottom: -150, left: -100 }} />

            <div className="relative grid items-start gap-7 min-[840px]:grid-cols-[1fr_.85fr] min-[840px]:gap-[clamp(28px,4vw,54px)]">
              <div>
                <Eyebrow>{contact.eyebrow}</Eyebrow>
                <h2 className="font-display text-[clamp(24px,3vw,34px)] font-semibold leading-[1.12] tracking-[-0.028em]">
                  {renderEmphasis(contact.title)}
                </h2>
                <p className="mt-[18px] max-w-[56ch] text-[17px] font-light leading-[1.6] text-txt-2">{contact.lede}</p>
              </div>

              <ContactForm endpoint={leadsEndpoint} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { promoBand } from "@/data/content";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { tenantUrl } from "@/lib/env";

export function PromoBand() {
  return (
    <section className="sec">
      <div className="wrap">
        <Reveal>
          <div className="c-band c-band--br p-[clamp(34px,4.5vw,54px)]">
            <div className="relative flex flex-wrap items-center justify-between gap-7">
              <div>
                <h2 className="font-display max-w-[20ch] text-[clamp(23px,3vw,34px)] text-white">
                  {promoBand.title}
                </h2>
                <p className="mt-3 max-w-[44ch] text-[16px] font-light text-white/80">{promoBand.body}</p>
              </div>
              <Button href={tenantUrl} variant="white" target="_blank" rel="noopener noreferrer">
                {promoBand.cta}
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

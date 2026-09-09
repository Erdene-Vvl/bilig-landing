import { hero } from "@/data/content";
import { Button } from "@/components/ui/Button";
import { Arc } from "@/components/ui/Arc";
import { textColor } from "@/lib/colors";
import { renderMoney } from "@/lib/money";
import { tenantUrl, tenantDemoUrl } from "@/lib/env";
import { ScheduleCard } from "./hero/ScheduleCard";

export function Hero() {
  return (
    <header
      className="hero relative overflow-hidden bg-bg pb-[clamp(66px,7vw,100px)] pt-[clamp(50px,6vw,84px)] xl:flex xl:min-h-[calc(100vh-70px)] xl:flex-col xl:justify-center"
      id="top"
    >
      <div className="c-hero-mesh" aria-hidden="true" />
      <div className="c-hero-glow" aria-hidden="true" />
      <div className="c-hero-glow2" aria-hidden="true" />
      <Arc variant="tr" />

      <div className="wrap relative grid items-center gap-[clamp(34px,4.5vw,64px)] min-[980px]:grid-cols-[1.02fr_.98fr]">
        <div>
          <span className="c-eyebrow">{hero.eyebrow}</span>
          <h1 className="font-display text-[clamp(33px,4.9vw,55px)] font-semibold leading-[1.06] tracking-[-0.035em]">
            {hero.titleLines[0]}
            <br />
            <em className="c-em">{hero.titleLines[1]}</em>
          </h1>
          <p className="mt-5.5 max-w-[45ch] text-[clamp(16.5px,1.5vw,19px)] font-light text-txt-2">
            {hero.sub}
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button href={tenantUrl} variant="pri" target="_blank" rel="noopener noreferrer">
              Үнэгүй турших
            </Button>
            <Button href={tenantDemoUrl} variant="sec" target="_blank" rel="noopener noreferrer">
              Демо үзэх
            </Button>
          </div>

          <div className="mt-9 flex flex-wrap gap-8.5 border-t border-line pt-6.5">
            {hero.stats.map((stat) => (
              <div key={stat.label}>
                <b className={`font-display block text-[25px] font-bold tracking-[-0.04em] ${textColor[stat.color]}`}>
                  {renderMoney(stat.value)}
                </b>
                <span className="text-[13.5px] text-txt-2">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <ScheduleCard />
      </div>
    </header>
  );
}

import { Hero } from "@/components/sections/Hero";
import { Problems } from "@/components/sections/Problems";
import { Features } from "@/components/sections/Features";
import { DayFlow } from "@/components/sections/DayFlow";
import { Modules } from "@/components/sections/Modules";
import { PromoBand } from "@/components/sections/PromoBand";
import { UserTypes } from "@/components/sections/UserTypes";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { tenantUrl } from "@/lib/env";

export default function Home() {
  return (
    <>
      <Hero />
      <Problems />
      <Features />
      <DayFlow />
      <Modules />
      <PromoBand />
      <UserTypes />
      <BeforeAfter />
      <Pricing tenantUrl={tenantUrl} />
      <FAQ />
    </>
  );
}

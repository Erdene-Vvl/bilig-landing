import { faq } from "@/data/content";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

const organizationId = `${siteUrl}/#organization`;

/**
 * schema.org JSON-LD for the home page: who publishes the site, what the
 * product is, and the FAQ that is rendered on the page. Every value mirrors
 * visible content — search engines ignore (or penalise) markup that doesn't.
 */
const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/icon-512.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      url: siteUrl,
      inLanguage: "mn",
      publisher: { "@id": organizationId },
    },
    {
      "@type": "SoftwareApplication",
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "mn",
      publisher: { "@id": organizationId },
    },
    {
      "@type": "FAQPage",
      mainEntity: faq.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

/** Serialized for a `<script type="application/ld+json">`; `<` is escaped so
 * no string in the data can close the script tag early. */
export const structuredData = JSON.stringify(graph).replace(/</g, "\\u003c");

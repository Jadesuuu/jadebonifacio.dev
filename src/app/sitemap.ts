import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getWorkSlugs } from "@/lib/work";

/** Home, work, about, contact, and one entry per case study in src/content/work. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${site.url}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/work`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/contact`, lastModified, changeFrequency: "yearly", priority: 0.6 },
    ...getWorkSlugs().map((slug) => ({
      url: `${site.url}/work/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Pages that exist today. Case studies (/work/[slug]) are added here when
 * their pages ship, so the sitemap never advertises a 404.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${site.url}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}

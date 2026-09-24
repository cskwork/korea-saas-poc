import type { MetadataRoute } from "next";
import { siteUrl } from "@/core/env";
import { MODULES } from "@/pocs/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteUrl();
  return [
    { url: origin, changeFrequency: "weekly", priority: 1 },
    ...MODULES.map((m) => ({ url: `${origin}/${m.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}

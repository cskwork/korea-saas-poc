/**
 * Module slugs, in catalogue order. A slug is the URL segment (`/smart-store`),
 * the folder name (`src/pocs/smart-store`) and — with dashes as underscores —
 * the Postgres schema that holds the module's tables (`smart_store`).
 *
 * Kept dependency-free: next.config.ts and drizzle.config.ts import it.
 */
export const MODULE_SLUGS = [
  "ai-content-agency",
  "smart-store",
  "micro-saas",
  "online-education",
  "affiliate-marketing",
  "automation-agency",
  "newsletter-community",
  "ai-design-video",
  "dev-freelancing",
  "niche-community",
] as const;

export type ModuleSlug = (typeof MODULE_SLUGS)[number];

/**
 * Modules that are shipped: routed, migrated, linked from the hub and the sitemap.
 * A module joins this list in the same change that merges it. Until then the hub
 * shows it as "준비 중" and its legacy static demo keeps serving under /pocs/.
 */
export const OPEN_MODULE_SLUGS: readonly ModuleSlug[] = [
  "ai-content-agency",
  "smart-store",
  "micro-saas",
  "affiliate-marketing",
  "ai-design-video",
];

export function isModuleOpen(slug: ModuleSlug): boolean {
  return OPEN_MODULE_SLUGS.includes(slug);
}

/** "smart-store" → "smart_store" */
export function pgSchemaName(slug: ModuleSlug): string {
  return slug.replaceAll("-", "_");
}

/** Path of the legacy static demo, e.g. "/pocs/03-micro-saas/index.html". */
export function legacyDemoPath(slug: ModuleSlug): string {
  return `/pocs/${legacyFolder(slug)}/index.html`;
}

/** "micro-saas" → "03-micro-saas" (the folder name of the pre-Next.js static POCs). */
export function legacyFolder(slug: ModuleSlug): string {
  return `${String(MODULE_SLUGS.indexOf(slug) + 1).padStart(2, "0")}-${slug}`;
}

/**
 * Module slugs, in catalogue order. A slug is the URL segment (`/smart-store`),
 * the folder name (`src/pocs/smart-store`) and — with dashes as underscores —
 * the Postgres schema that holds the module's tables (`smart_store`).
 *
 * Kept dependency-free: next.config.ts imports it for legacy redirects.
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

/** "smart-store" → "smart_store" */
export function pgSchemaName(slug: ModuleSlug): string {
  return slug.replaceAll("-", "_");
}

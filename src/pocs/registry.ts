import type { ModuleMeta } from "@/core/modules/meta";
import { meta as aiContentAgency } from "./ai-content-agency/meta";
import { meta as smartStore } from "./smart-store/meta";
import { meta as microSaas } from "./micro-saas/meta";
import { meta as onlineEducation } from "./online-education/meta";
import { meta as affiliateMarketing } from "./affiliate-marketing/meta";
import { meta as automationAgency } from "./automation-agency/meta";
import { meta as newsletterCommunity } from "./newsletter-community/meta";
import { meta as aiDesignVideo } from "./ai-design-video/meta";
import { meta as devFreelancing } from "./dev-freelancing/meta";
import { meta as nicheCommunity } from "./niche-community/meta";

/**
 * The module catalogue. Adding a module: create src/pocs/<slug>/ (see
 * docs/ARCHITECTURE.md), add its slug to ./slugs.ts and its meta here.
 */
export const MODULES: readonly ModuleMeta[] = [
  aiContentAgency,
  smartStore,
  microSaas,
  onlineEducation,
  affiliateMarketing,
  automationAgency,
  newsletterCommunity,
  aiDesignVideo,
  devFreelancing,
  nicheCommunity,
].sort((a, b) => a.order - b.order);

export function getModuleMeta(slug: string): ModuleMeta | undefined {
  return MODULES.find((m) => m.slug === slug);
}

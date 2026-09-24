import type { ModuleSlug } from "@/pocs/slugs";

/** Catalogue card data for a module: used by the hub, metadata and the sitemap. */
export interface ModuleMeta {
  slug: ModuleSlug;
  /** Position in the catalogue (1–10). */
  order: number;
  /** Product name as shown to users, e.g. "예약잇다". */
  name: string;
  /** Business model it demonstrates, e.g. "마이크로 SaaS". */
  category: string;
  /** One line, under ~40 Korean characters. */
  tagline: string;
  /** Two sentences at most. */
  description: string;
  /** Who it is for. */
  audience: string;
  /** The module's signature colour (hex), used to hint its world on the hub. */
  accent: string;
}

export function defineMeta(meta: ModuleMeta): ModuleMeta {
  return meta;
}

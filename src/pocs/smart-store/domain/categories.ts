/**
 * Product categories and the Naver category fee table this tool applies
 * (legacy POC table, 3.5%–7.0%). Fees are basis points: 550 = 5.5%.
 */
export const CATEGORIES = ["fashion", "beauty", "living", "digital", "food", "etc"] as const;
export type Category = (typeof CATEGORIES)[number];

interface CategoryInfo {
  label: string;
  /** Longer label used where the fee table is shown. */
  feeLabel: string;
  feeRateBp: number;
}

export const CATEGORY_INFO: Record<Category, CategoryInfo> = {
  fashion: { label: "패션", feeLabel: "패션의류/잡화", feeRateBp: 550 },
  beauty: { label: "뷰티", feeLabel: "뷰티", feeRateBp: 400 },
  living: { label: "생활/주방", feeLabel: "생활/주방", feeRateBp: 600 },
  digital: { label: "전자기기", feeLabel: "전자기기", feeRateBp: 350 },
  food: { label: "식품", feeLabel: "식품", feeRateBp: 700 },
  etc: { label: "기타", feeLabel: "기타", feeRateBp: 500 },
};

/** Categories the wholesale catalogue is organised by (기타 exists only for the calculator). */
export const CATALOG_CATEGORIES = CATEGORIES.filter((c) => c !== "etc");

export function categoryLabel(category: Category): string {
  return CATEGORY_INFO[category].label;
}

export function feeRateBp(category: Category): number {
  return CATEGORY_INFO[category].feeRateBp;
}

/** 550 → "5.5%" */
export function formatFeeRate(bp: number): string {
  return `${(bp / 100).toFixed(1)}%`;
}

export const SUPPLIERS = ["domeme", "domeggook"] as const;
export type Supplier = (typeof SUPPLIERS)[number];

export const SUPPLIER_LABEL: Record<Supplier, string> = {
  domeme: "도매매",
  domeggook: "도매꾹",
};

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}

export function isSupplier(value: unknown): value is Supplier {
  return typeof value === "string" && (SUPPLIERS as readonly string[]).includes(value);
}

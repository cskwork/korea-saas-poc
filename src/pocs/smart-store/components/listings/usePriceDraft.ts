"use client";

import { useMemo, useState } from "react";
import { feeRateBp, type Category } from "../../domain/categories";
import { computeMargin } from "../../domain/margin";

/** "12,900" or "12900원" → 12900; blank or junk → 0. */
export function parseWon(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Math.min(Number.parseInt(digits, 10), 100_000_000) : 0;
}

/**
 * Price, cost and shipping as typed, plus the live margin the hang tag shows.
 * `touched` turns on the tag's re-inking once the seller starts typing.
 */
export function usePriceDraft(initial: { price: number; cost: number; shipping: number }, category: Category) {
  const [values, setValues] = useState({
    price: String(initial.price || ""),
    cost: String(initial.cost || ""),
    shipping: String(initial.shipping ?? 0),
  });
  const [touched, setTouched] = useState(false);
  const margin = useMemo(
    () =>
      computeMargin({
        price: parseWon(values.price),
        cost: parseWon(values.cost),
        shipping: parseWon(values.shipping),
        feeRateBp: feeRateBp(category),
      }),
    [values, category],
  );
  const set = (key: keyof typeof values) => (value: string) => {
    setTouched(true);
    setValues((current) => ({ ...current, [key]: value }));
  };
  return { values, set, margin, touched };
}

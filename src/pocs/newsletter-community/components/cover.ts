/**
 * Every numbered issue owns one printing ink, like a monthly magazine's cover.
 * Unnumbered drafts borrow the ink of the number they are expected to take.
 */
export const COVER_INKS = ["jjok", "juhong", "ssuk", "hwang", "jaju", "cheongrok", "meokhoe", "bunhong"] as const;
export type CoverInk = (typeof COVER_INKS)[number];

export function coverInk(number: number): CoverInk {
  const index = (((number - 1) % COVER_INKS.length) + COVER_INKS.length) % COVER_INKS.length;
  return COVER_INKS[index];
}

import { Black_Han_Sans } from "next/font/google";

/**
 * Signboard lettering (검은고딕): page titles, the wordmark and prices on the
 * hang tags only. Everything else is Pretendard (loaded globally).
 * Google serves the Hangul glyphs as unicode-range slices; only Latin (digits,
 * ₩) is preloaded.
 */
export const signFont = Black_Han_Sans({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sign",
});

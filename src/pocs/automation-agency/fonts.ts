import { Barlow_Semi_Condensed } from "next/font/google";

/**
 * Signage face for station codes, line badges and English sub-labels only
 * (the way metro signs set their numbering). Hangul and all data use Pretendard.
 */
export const signFont = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--aa-font-sign",
  display: "swap",
});

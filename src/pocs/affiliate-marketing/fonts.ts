import { Archivo, Black_Han_Sans } from "next/font/google";

/** Signboard display face for headings and the wordmark (Korean flyer lettering). */
export const displayFont = Black_Han_Sans({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--am-font-display",
  fallback: ["Pretendard Variable", "sans-serif"],
});

/** Condensed heavy numerals for prices, like a shelf label's price. */
export const figureFont = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--am-font-figure",
  fallback: ["Pretendard Variable", "sans-serif"],
});

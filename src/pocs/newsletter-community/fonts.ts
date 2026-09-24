import { Hahmlet } from "next/font/google";

/**
 * Hahmlet: a contemporary 명조 with a variable weight axis. It sets the 제호,
 * titles and issue numerals; everything operational stays in Pretendard.
 * Korean glyphs arrive through unicode-range slices on demand, so nothing is preloaded.
 */
export const myeongjo = Hahmlet({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  preload: false,
  variable: "--nc-myeongjo",
});

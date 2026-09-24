import { Doto } from "next/font/google";

/**
 * Doto — a dot-matrix face, used only for LED digits (the pitch timer on the stage band
 * and meetup times). Everything else is set in Pretendard, loaded globally.
 */
export const ledFont = Doto({
  subsets: ["latin"],
  axes: ["ROND"],
  display: "swap",
  variable: "--nc-font-led",
});

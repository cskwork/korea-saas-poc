import { Black_Han_Sans } from "next/font/google";

/**
 * Black Han Sans: the carved seal face. It appears only inside stamps and the brand seal,
 * so it is not preloaded; the browser fetches only the Hangul slices a page's seals use.
 */
export const sealFace = Black_Han_Sans({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-seal-face",
});

import { Barlow_Condensed, Black_Han_Sans } from "next/font/google";

/** Condensed numerals of a printed production form: cut numbers, durations, aspect labels. */
export const formNumerals = Barlow_Condensed({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-form",
  display: "swap",
});

/** The heavy Korean gothic of a thumbnail rough, used only inside frames. */
export const roughHeadline = Black_Han_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-rough",
  display: "swap",
  preload: false,
});

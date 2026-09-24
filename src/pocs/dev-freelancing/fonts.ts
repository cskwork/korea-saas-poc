import { JetBrains_Mono } from "next/font/google";

/**
 * DevFlow's measuring face: the monospace developers already read all day, used only for measured
 * data (the running clock, hours, document numbers). All other text is Pretendard (global).
 */
export const measureFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--df-font-measure",
  display: "swap",
});

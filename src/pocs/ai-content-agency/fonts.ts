import { Do_Hyeon } from "next/font/google";

/**
 * Do Hyeon: the free sign-painter gothic Korean small shops print their banners and
 * menu boards in. Display only (titles, banner proofs, D-day stickers, prices);
 * UI and data stay in Pretendard.
 */
export const bannerFace = Do_Hyeon({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-banner",
});

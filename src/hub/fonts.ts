import { Do_Hyeon } from "next/font/google";

/** Sign-painter lettering. Used only on sign boards (entrance board and stall signs). */
export const signFace = Do_Hyeon({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sign",
  preload: false,
});

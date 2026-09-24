import type { ReactNode } from "react";
import { sealFace } from "../../fonts";
import { InkDefs } from "./Stamp";
import world from "./world.module.css";

/** The form paper every 예약잇다 page is printed on: tokens, seal face and the ink filter. */
export function ModuleRoot({ children }: { children: ReactNode }) {
  return (
    <div className={`${world.root} ${sealFace.variable}`}>
      <InkDefs />
      {children}
    </div>
  );
}

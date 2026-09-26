import { bannerFace } from "../../fonts";
import styles from "./shell.module.css";

/** The module's token scope and display face; each route group adds its own chrome inside. */
export function ModuleRoot({ children }: { children: React.ReactNode }) {
  return <div className={`${styles.root} ${bannerFace.variable}`}>{children}</div>;
}

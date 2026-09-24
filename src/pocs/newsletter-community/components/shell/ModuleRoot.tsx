import clsx from "clsx";
import { myeongjo } from "../../fonts";
import theme from "../theme.module.css";
import { Toaster } from "../ui/Toaster";

/** The module's root: tokens, the 명조 face and the toast region. */
export function ModuleRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className={clsx(theme.root, myeongjo.variable)}>
      <Toaster>{children}</Toaster>
    </div>
  );
}

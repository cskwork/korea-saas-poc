import type { ReactNode } from "react";
import { StudioShell } from "@/pocs/online-education/components/shell/StudioShell";
import { getSchool } from "@/pocs/online-education/server/queries";

export default async function StudioLayout({ children }: { children: ReactNode }) {
  const school = await getSchool();
  return <StudioShell school={school}>{children}</StudioShell>;
}

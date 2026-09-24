import type { ReactNode } from "react";
import { SchoolShell } from "@/pocs/online-education/components/shell/SchoolShell";
import { getSchool } from "@/pocs/online-education/server/queries";

export default async function SchoolLayout({ children }: { children: ReactNode }) {
  const school = await getSchool();
  return <SchoolShell school={school}>{children}</SchoolShell>;
}

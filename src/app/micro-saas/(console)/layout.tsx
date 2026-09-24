import type { ReactNode } from "react";
import { ConsoleShell } from "@/pocs/micro-saas/components/shell/ConsoleShell";
import { getShell } from "@/pocs/micro-saas/server/queries";

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  const { shop, services, today } = await getShell();
  return (
    <ConsoleShell shop={shop} services={services} today={today}>
      {children}
    </ConsoleShell>
  );
}

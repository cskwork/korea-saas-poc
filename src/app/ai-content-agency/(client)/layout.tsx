import { ClientShell } from "@/pocs/ai-content-agency/components/shell/ClientShell";

/** Pages a client opens: the delivery note, without the operator's console. */
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <ClientShell>{children}</ClientShell>;
}

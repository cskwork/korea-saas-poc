import { Shell } from "@/pocs/dev-freelancing/components/shell/Shell";
import { getShell } from "@/pocs/dev-freelancing/server/queries";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const shell = await getShell();
  return (
    <Shell
      displayName={shell.displayName}
      badges={{ projects: shell.activeProjects, invoices: shell.openInvoices }}
      timer={shell.timer}
      projects={shell.projects}
      todayMinutes={shell.todayMinutes}
    >
      {children}
    </Shell>
  );
}

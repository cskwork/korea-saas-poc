import { ConsoleShell } from "@/pocs/ai-content-agency/components/shell/ConsoleShell";
import { getAiMode } from "@/pocs/ai-content-agency/server/queries";

/** The operator's pages: masthead menu, demo controls, AI status. */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <ConsoleShell aiMode={getAiMode()}>{children}</ConsoleShell>;
}

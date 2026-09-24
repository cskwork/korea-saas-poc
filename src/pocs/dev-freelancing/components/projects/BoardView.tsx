import type { ClientOption } from "../../server/data/clients";
import type { BoardProject } from "../../server/data/projects";
import { PageHeader } from "../ui/PageHeader";
import { Board } from "./Board";
import { NewProjectPanel } from "./NewProjectPanel";
import styles from "./BoardView.module.css";

export function BoardView({
  projects,
  clients,
  today,
  openNew,
}: {
  projects: BoardProject[];
  clients: ClientOption[];
  today: string;
  openNew: boolean;
}) {
  const active = projects.filter((p) => p.status === "progress" || p.status === "review").length;
  const inquiries = projects.filter((p) => p.status === "inquiry").length;
  return (
    <div className={styles.page}>
      <PageHeader title="프로젝트" description={`진행 ${active}건 · 문의 ${inquiries}건. 문의 → 진행 중 → 검수 중 → 완료 순서로 옮겨요.`} />
      <NewProjectPanel clients={clients} defaultOpen={openNew} />
      <Board projects={projects} today={today} />
    </div>
  );
}

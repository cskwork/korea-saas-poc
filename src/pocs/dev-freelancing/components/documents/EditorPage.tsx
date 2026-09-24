import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ClientOption } from "../../server/data/clients";
import type { Profile } from "../../server/data/profile";
import { buttonClass } from "../ui/button";
import { PageHeader } from "../ui/PageHeader";
import ui from "../ui/ui.module.css";
import { DocumentEditor, type EditorDraft } from "./DocumentEditor";
import styles from "./DocumentsList.module.css";

interface EditorPageProps {
  kind: "estimate" | "invoice";
  title: string;
  description: string;
  back: { href: string; label: string };
  initial: EditorDraft;
  clients: ClientOption[];
  projects: { id: string; title: string; clientId: string | null }[];
  profile: Profile;
}

export function EditorPage({ kind, title, description, back, initial, clients, projects, profile }: EditorPageProps) {
  return (
    <div className={styles.page}>
      <Link href={back.href} className={ui.textLink}>
        <ArrowLeft size={14} aria-hidden="true" /> {back.label}
      </Link>
      <PageHeader title={title} description={description} />
      <DocumentEditor kind={kind} initial={initial} clients={clients} projects={projects} supplier={profile} hourlyRate={profile.hourlyRate} />
    </div>
  );
}

/** Shown instead of the editor when a sent document can no longer be edited in place. */
export function LockedDocument({ message, href }: { message: string; href: string }) {
  return (
    <div className={styles.page}>
      <PageHeader title="고칠 수 없는 문서예요" description={message} />
      <Link href={href} className={buttonClass("primary")}>
        문서로 돌아가기
      </Link>
    </div>
  );
}

"use client";

import type { ClientOption } from "../../server/data/clients";
import { EditToggle } from "./EditToggle";
import { ProjectForm, type ProjectDraft } from "./ProjectForm";

export function ProjectEditor({ project, clients }: { project: ProjectDraft; clients: ClientOption[] }) {
  return <EditToggle label="정보 편집" render={(close) => <ProjectForm clients={clients} project={project} onSaved={close} />} />;
}

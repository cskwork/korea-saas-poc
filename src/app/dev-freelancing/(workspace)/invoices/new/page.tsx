import type { Metadata } from "next";
import { EditorPage } from "@/pocs/dev-freelancing/components/documents/EditorPage";
import { addDays } from "@/pocs/dev-freelancing/domain/dates";
import { getDocumentEditorData } from "@/pocs/dev-freelancing/server/queries";

export const metadata: Metadata = {
  title: "새 인보이스",
  description: "견적서 없이 바로 청구할 때: 항목과 세금 처리를 정하고 인보이스를 발행합니다.",
};

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ client?: string; project?: string }> }) {
  const [params, data] = await Promise.all([searchParams, getDocumentEditorData()]);
  const project = data.projects.find((p) => p.id === params.project);
  const client = data.clients.find((c) => c.id === (params.client ?? project?.clientId));
  return (
    <EditorPage
      kind="invoice"
      title="새 인보이스"
      description="견적서에서 전환하면 항목이 자동으로 채워져요. 여기서는 유지보수비처럼 바로 청구할 때 써요."
      back={{ href: "/dev-freelancing/documents?tab=invoices", label: "견적 · 청구" }}
      clients={data.clients}
      projects={data.projects}
      profile={data.profile}
      initial={{
        clientId: client?.id ?? null,
        projectId: project?.id ?? null,
        title: project?.title ?? "",
        taxMode: data.profile.taxMode,
        discount: 0,
        issuedOn: data.today,
        deadline: addDays(data.today, 14),
        notes: "",
        items: [{ title: "", unit: "lump", quantity: 1, unitPrice: 0 }],
      }}
    />
  );
}

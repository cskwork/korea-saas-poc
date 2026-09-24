import type { Metadata } from "next";
import { EditorPage } from "@/pocs/dev-freelancing/components/documents/EditorPage";
import { addDays } from "@/pocs/dev-freelancing/domain/dates";
import { getDocumentEditorData } from "@/pocs/dev-freelancing/server/queries";

// The "요청서로 초안 만들기" action on this page may call Claude.
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "새 견적서",
  description: "기능별 시간 × 시급으로 견적 항목을 나누고, 원천징수 3.3% 또는 부가세 10%를 적용한 견적서를 만듭니다.",
};

export default async function NewEstimatePage({ searchParams }: { searchParams: Promise<{ client?: string; project?: string }> }) {
  const [params, data] = await Promise.all([searchParams, getDocumentEditorData()]);
  const project = data.projects.find((p) => p.id === params.project);
  const client = data.clients.find((c) => c.id === (params.client ?? project?.clientId));
  return (
    <EditorPage
      kind="estimate"
      title="새 견적서"
      description="항목을 채우면 오른쪽 문서가 바로 바뀌어요. 저장하면 번호가 매겨지고 ‘작성 중’ 상태가 돼요."
      back={{ href: "/dev-freelancing/documents", label: "견적 · 청구" }}
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
        deadline: addDays(data.today, 30),
        notes: "",
        items: [{ title: "", unit: "hour", quantity: 8, unitPrice: data.profile.hourlyRate }],
      }}
    />
  );
}

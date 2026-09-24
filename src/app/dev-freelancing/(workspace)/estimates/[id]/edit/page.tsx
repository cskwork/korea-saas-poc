import type { Metadata } from "next";
import { EditorPage, LockedDocument } from "@/pocs/dev-freelancing/components/documents/EditorPage";
import { isEstimateEditable } from "@/pocs/dev-freelancing/domain/documents";
import { getDocumentEditorData, getEstimate } from "@/pocs/dev-freelancing/server/queries";

export const maxDuration = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { estimate } = await getEstimate((await params).id);
  return { title: `견적서 고치기 · ${estimate.number}` };
}

export default async function EditEstimatePage({ params }: Props) {
  const { id } = await params;
  const [{ estimate }, data] = await Promise.all([getEstimate(id), getDocumentEditorData()]);
  if (!isEstimateEditable(estimate.status)) {
    return <LockedDocument message="발송한 견적서는 ‘작성 중으로 되돌리기’를 한 뒤 고칠 수 있어요." href={`/dev-freelancing/estimates/${id}`} />;
  }
  return (
    <EditorPage
      kind="estimate"
      title={`견적서 고치기`}
      description={`${estimate.number} · 저장하면 같은 번호로 바뀐 내용이 남아요.`}
      back={{ href: `/dev-freelancing/estimates/${id}`, label: estimate.number }}
      clients={data.clients}
      projects={data.projects}
      profile={data.profile}
      initial={{
        id: estimate.id,
        number: estimate.number,
        clientId: estimate.clientId,
        projectId: estimate.projectId,
        title: estimate.title,
        taxMode: estimate.taxMode,
        discount: estimate.discount,
        issuedOn: estimate.issuedOn,
        deadline: estimate.validUntil,
        notes: estimate.notes,
        items: estimate.lines.map(({ title, unit, quantity, unitPrice }) => ({ title, unit, quantity, unitPrice })),
      }}
    />
  );
}

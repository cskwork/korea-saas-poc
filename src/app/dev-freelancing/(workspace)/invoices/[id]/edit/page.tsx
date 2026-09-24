import type { Metadata } from "next";
import { EditorPage, LockedDocument } from "@/pocs/dev-freelancing/components/documents/EditorPage";
import { isInvoiceEditable } from "@/pocs/dev-freelancing/domain/documents";
import { getDocumentEditorData, getInvoice } from "@/pocs/dev-freelancing/server/queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { invoice } = await getInvoice((await params).id);
  return { title: `인보이스 고치기 · ${invoice.number}` };
}

export default async function EditInvoicePage({ params }: Props) {
  const { id } = await params;
  const [{ invoice }, data] = await Promise.all([getInvoice(id), getDocumentEditorData()]);
  if (!isInvoiceEditable(invoice.status)) {
    return <LockedDocument message="발송한 인보이스는 ‘발송 전으로 되돌리기’를 한 뒤 고칠 수 있어요." href={`/dev-freelancing/invoices/${id}`} />;
  }
  return (
    <EditorPage
      kind="invoice"
      title="인보이스 고치기"
      description={`${invoice.number} · 발송 전이라 고칠 수 있어요.`}
      back={{ href: `/dev-freelancing/invoices/${id}`, label: invoice.number }}
      clients={data.clients}
      projects={data.projects}
      profile={data.profile}
      initial={{
        id: invoice.id,
        number: invoice.number,
        clientId: invoice.clientId,
        projectId: invoice.projectId,
        title: invoice.title,
        taxMode: invoice.taxMode,
        discount: invoice.discount,
        issuedOn: invoice.issuedOn,
        deadline: invoice.dueOn,
        notes: invoice.notes,
        items: invoice.lines.map(({ title, unit, quantity, unitPrice }) => ({ title, unit, quantity, unitPrice })),
      }}
    />
  );
}

import { NotFoundView } from "@/pocs/dev-freelancing/components/ui/NotFoundView";

export default function InvoiceNotFound() {
  return <NotFoundView title="인보이스를 찾을 수 없어요" href="/dev-freelancing/documents?tab=invoices" back="견적 · 청구로" />;
}

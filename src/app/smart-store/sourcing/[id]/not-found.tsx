import { NotFoundSlip } from "@/pocs/smart-store/components/ui/NotFoundSlip";

export default function NotFound() {
  return <NotFoundSlip title="도매 상품을 찾을 수 없어요." href="/smart-store/sourcing" linkLabel="소싱 목록으로" />;
}

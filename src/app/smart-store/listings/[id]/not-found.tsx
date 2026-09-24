import { NotFoundSlip } from "@/pocs/smart-store/components/ui/NotFoundSlip";

export default function NotFound() {
  return <NotFoundSlip title="등록 상품을 찾을 수 없어요." href="/smart-store/listings" linkLabel="등록 상품으로" />;
}

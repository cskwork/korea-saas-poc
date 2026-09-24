import { NotFoundState } from "@/pocs/online-education/components/states/NotFoundState";

export default function ProductNotFound() {
  return (
    <NotFoundState
      title="이 상품을 찾을 수 없어요"
      text="삭제되었거나 다른 스쿨의 상품일 수 있어요."
      href="/online-education/products"
      action="상품 목록으로"
    />
  );
}

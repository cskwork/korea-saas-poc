import type { Metadata } from "next";
import { NewListingPage } from "@/pocs/smart-store/components/listings/NewListingPage";
import { getCopywriterStatus } from "@/pocs/smart-store/server/queries";

export const metadata: Metadata = {
  title: "직접 입력해 등록",
  description: "도매처 상품명과 가격을 넣으면 AI가 네이버 검색용 상품명·상세설명·키워드를 쓰고 판매를 시작합니다.",
};

export const maxDuration = 60;

export default function Page() {
  return <NewListingPage writer={getCopywriterStatus()} />;
}

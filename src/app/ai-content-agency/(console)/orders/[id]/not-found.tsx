import Link from "next/link";
import { buttonClass } from "@/pocs/ai-content-agency/components/ui/buttons";
import { Empty } from "@/pocs/ai-content-agency/components/ui/PageHeader";

export default function OrderNotFound() {
  return (
    <Empty title="이 의뢰를 찾을 수 없어요.">
      <p>삭제됐거나, 데모 데이터를 초기화해서 번호가 바뀌었을 수 있어요.</p>
      <Link href="/ai-content-agency/orders" className={buttonClass("primary")}>
        의뢰 게시대로
      </Link>
    </Empty>
  );
}

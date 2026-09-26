import Link from "next/link";
import { buttonClass } from "@/pocs/ai-content-agency/components/ui/buttons";
import { Empty } from "@/pocs/ai-content-agency/components/ui/PageHeader";

export default function ContentAgencyNotFound() {
  return (
    <Empty title="찾는 페이지가 없어요.">
      <p>지워졌거나 다른 작업실의 주소일 수 있어요.</p>
      <Link href="/ai-content-agency" className={buttonClass("primary")}>
        현황으로
      </Link>
    </Empty>
  );
}

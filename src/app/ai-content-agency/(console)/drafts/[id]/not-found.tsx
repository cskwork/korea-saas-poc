import Link from "next/link";
import { buttonClass } from "@/pocs/ai-content-agency/components/ui/buttons";
import { Empty } from "@/pocs/ai-content-agency/components/ui/PageHeader";

export default function DraftNotFound() {
  return (
    <Empty title="이 원고를 찾을 수 없어요.">
      <p>삭제됐거나, 데모 데이터를 초기화해서 사라졌을 수 있어요.</p>
      <Link href="/ai-content-agency/drafts" className={buttonClass("primary")}>
        원고함으로
      </Link>
    </Empty>
  );
}

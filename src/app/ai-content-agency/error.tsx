"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { buttonClass } from "@/pocs/ai-content-agency/components/ui/buttons";
import { Empty } from "@/pocs/ai-content-agency/components/ui/PageHeader";
import ui from "@/pocs/ai-content-agency/components/ui/ui.module.css";

export default function ContentAgencyError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  // The server log carries the full error under this digest; the page only shows the code.
  return (
    <Empty title="이 화면을 불러오지 못했어요.">
      <p>
        잠시 뒤 다시 시도해 주세요. 계속되면 현황으로 돌아가 다른 메뉴부터 열어 보세요.
        {error.digest ? ` (오류 코드 ${error.digest})` : ""}
      </p>
      <div className={ui.pageActions}>
        <button type="button" className={buttonClass("primary")} onClick={() => retry()}>
          <RotateCcw size={16} aria-hidden="true" />
          다시 시도
        </button>
        <Link href="/ai-content-agency" className={buttonClass("secondary")}>
          현황으로
        </Link>
      </div>
    </Empty>
  );
}

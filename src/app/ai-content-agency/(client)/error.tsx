"use client";

import { RotateCcw } from "lucide-react";
import { buttonClass } from "@/pocs/ai-content-agency/components/ui/buttons";
import { Empty } from "@/pocs/ai-content-agency/components/ui/PageHeader";

export default function DeliveryError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Empty title="납품서를 불러오지 못했어요.">
      <p>
        잠시 뒤 다시 열어 주세요.{error.digest ? ` (오류 코드 ${error.digest})` : ""}
      </p>
      <button type="button" className={buttonClass("primary")} onClick={() => retry()}>
        <RotateCcw size={16} aria-hidden="true" />
        다시 시도
      </button>
    </Empty>
  );
}

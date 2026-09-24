"use client";

import { RotateCcw } from "lucide-react";
import clsx from "clsx";
import { resetDemoAction } from "../../server/actions";
import { ConfirmButton } from "../ui/form";
import ui from "../ui/ui.module.css";

export function ResetDemoButton({ compact = false }: { compact?: boolean }) {
  return (
    <ConfirmButton
      run={() => resetDemoAction({})}
      label="데모 데이터 초기화"
      confirmLabel="초기화"
      prompt="바꾼 내용이 모두 사라져요."
      icon={<RotateCcw size={15} aria-hidden />}
      className={clsx(ui.button, compact ? ui.small : undefined, ui.ghost)}
    />
  );
}

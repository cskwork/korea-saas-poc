"use client";

import clsx from "clsx";
import { Trash2 } from "lucide-react";
import { deleteCourseAction } from "../../server/actions";
import { ConfirmButton } from "../ui/form";
import ui from "../ui/ui.module.css";

export function DeleteCourse({ id, students }: { id: string; students: number }) {
  return (
    <section className={ui.dangerZone} aria-label="강의 삭제">
      <div>
        <h2 className={ui.sectionTitle}>강의 삭제</h2>
        <p>
          커리큘럼과 {students > 0 ? `수강생 ${students}명의 수강 기록이` : "강의 정보가"} 함께 지워져요. 결제 기록은 수익 분석에
          남아요. 잠시 판매만 멈추려면 비공개로 돌리세요.
        </p>
      </div>
      <ConfirmButton
        run={() => deleteCourseAction({ id })}
        label="강의 삭제"
        confirmLabel="영구 삭제"
        prompt="되돌릴 수 없어요."
        icon={<Trash2 size={15} aria-hidden />}
        className={clsx(ui.button, ui.danger)}
      />
    </section>
  );
}

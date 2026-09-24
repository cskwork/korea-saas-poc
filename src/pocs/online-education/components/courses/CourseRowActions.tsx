"use client";

import clsx from "clsx";
import { EyeOff, Send, Trash2 } from "lucide-react";
import { deleteCourseAction, setCourseStatusAction } from "../../server/actions";
import { ActionButton, ConfirmButton } from "../ui/form";
import ui from "../ui/ui.module.css";

/** Publish toggle and delete for one course. */
export function CourseRowActions({
  id,
  status,
  students,
  showDelete = true,
}: {
  id: string;
  status: "draft" | "published";
  students: number;
  showDelete?: boolean;
}) {
  const next = status === "published" ? "draft" : "published";
  return (
    <>
      <ActionButton
        run={() => setCourseStatusAction({ courseId: id, status: next })}
        className={clsx(ui.button, ui.small, next === "published" ? ui.primary : undefined)}
        pendingLabel={next === "published" ? "게시하는 중" : "돌리는 중"}
        showSuccess={false}
      >
        {next === "published" ? <Send size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
        {next === "published" ? "게시하기" : "비공개로"}
      </ActionButton>
      {showDelete ? (
        <ConfirmButton
          run={() => deleteCourseAction({ id })}
          label="삭제"
          confirmLabel="삭제"
          prompt={students > 0 ? `수강생 ${students}명의 수강 기록도 지워져요.` : "이 강의를 지울까요?"}
          icon={<Trash2 size={14} aria-hidden />}
          className={clsx(ui.button, ui.small, ui.ghost, ui.danger)}
        />
      ) : null}
    </>
  );
}

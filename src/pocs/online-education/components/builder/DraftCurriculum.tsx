"use client";

import clsx from "clsx";
import { Sparkles } from "lucide-react";
import { draftCurriculumAction } from "../../server/actions";
import { ActionButton } from "../ui/form";
import ui from "../ui/ui.module.css";
import styles from "./builder.module.css";

/** Offered on an empty course: a first curriculum from the title, category and outcomes. */
export function DraftCurriculum({ courseId, aiEnabled }: { courseId: string; aiEnabled: boolean }) {
  return (
    <div className={styles.draft}>
      <p className={styles.draftTitle}>커리큘럼 초안부터 받아 볼까요?</p>
      <p className={styles.draftText}>
        {aiEnabled
          ? "Claude가 강의 제목·소개·배울 내용을 읽고 섹션과 레슨을 짜 드려요. 넣은 뒤에 블록마다 고치면 돼요."
          : "강의 제목과 배울 내용으로 기본 템플릿 초안을 넣어 드려요. (AI 키가 설정되지 않아 템플릿으로 만들어요.)"}
      </p>
      <ActionButton
        run={() => draftCurriculumAction({ id: courseId })}
        className={clsx(ui.button, ui.small)}
        pendingLabel={aiEnabled ? "Claude가 짜는 중" : "넣는 중"}
      >
        <Sparkles size={14} aria-hidden />
        초안 넣기
      </ActionButton>
    </div>
  );
}

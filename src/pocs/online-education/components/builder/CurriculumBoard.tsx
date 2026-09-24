"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import clsx from "clsx";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";
import type { ActionState } from "@/core/actions";
import type { CourseColor, LessonType } from "../../db/schema";
import { LESSON_TYPES, lessonTypeLabel } from "../../domain/catalog";
import { formatClock, formatRuntime, toMinutes } from "../../domain/duration";
import {
  addLessonAction,
  addSectionAction,
  deleteLessonAction,
  deleteSectionAction,
  moveLessonAction,
  moveSectionAction,
  renameSectionAction,
  updateLessonAction,
} from "../../server/actions";
import { LessonTypeIcon } from "../timetable/LessonTypeIcon";
import { ConfirmButton, FieldMessage, fieldAttrs, FormNotice, SubmitButton, useFormAction } from "../ui/form";
import { useFlip } from "../ui/useFlip";
import ui from "../ui/ui.module.css";
import styles from "./builder.module.css";

export interface BoardLesson {
  id: string;
  title: string;
  type: LessonType;
  durationSeconds: number;
  isPreview: boolean;
}

export interface BoardSection {
  id: string;
  title: string;
  lessons: BoardLesson[];
}

type Direction = "up" | "down";
type Change =
  | { kind: "moveLesson"; id: string; direction: Direction }
  | { kind: "deleteLesson"; id: string }
  | { kind: "moveSection"; id: string; direction: Direction }
  | { kind: "deleteSection"; id: string };

function swap<T>(items: T[], index: number, direction: Direction): T[] {
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Applies a change locally so the board answers instantly; the server result replaces it. */
function applyChange(sections: BoardSection[], change: Change): BoardSection[] {
  switch (change.kind) {
    case "moveSection":
      return swap(sections, sections.findIndex((s) => s.id === change.id), change.direction);
    case "deleteSection":
      return sections.filter((s) => s.id !== change.id);
    case "moveLesson":
      return sections.map((s) => ({ ...s, lessons: swap(s.lessons, s.lessons.findIndex((l) => l.id === change.id), change.direction) }));
    case "deleteLesson":
      return sections.map((s) => ({ ...s, lessons: s.lessons.filter((l) => l.id !== change.id) }));
  }
}

/**
 * The curriculum as a timetable: sections are columns, lessons are blocks whose
 * height grows with running time. Every edit happens in place.
 */
export function CurriculumBoard({ courseId, color, sections }: { courseId: string; color: CourseColor; sections: BoardSection[] }) {
  const [board, change] = useOptimistic(sections, applyChange);
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<ActionState<unknown>>({ status: "idle" });
  const boardRef = useRef<HTMLDivElement>(null);
  useFlip(boardRef, board);

  const run = (optimistic: Change, action: () => Promise<ActionState<unknown>>) =>
    startTransition(async () => {
      change(optimistic);
      const result = await action();
      setStatus(result.status === "error" ? result : { status: "idle" });
    });

  const moveLesson = (id: string, direction: Direction) =>
    run({ kind: "moveLesson", id, direction }, () => moveLessonAction({ id, direction }));
  const moveSection = (id: string, direction: Direction) =>
    run({ kind: "moveSection", id, direction }, () => moveSectionAction({ id, direction }));

  return (
    <div className={styles.boardWrap}>
      <p role="status" aria-live="polite" className={styles.boardStatus}>
        {status.status === "error" ? status.message : ""}
      </p>
      <div ref={boardRef} className={styles.board} data-color={color}>
        {board.map((section, index) => (
          <SectionColumn
            key={section.id}
            section={section}
            index={index}
            count={board.length}
            sections={board}
            onMoveSection={moveSection}
            onMoveLesson={moveLesson}
            // Called inside the confirm button's transition, so the optimistic removal holds until the server answers.
            onDeleteSection={() => {
              change({ kind: "deleteSection", id: section.id });
              return deleteSectionAction({ id: section.id });
            }}
            onDeleteLesson={(id) => {
              change({ kind: "deleteLesson", id });
              return deleteLessonAction({ id });
            }}
          />
        ))}
        <AddSection courseId={courseId} first={board.length === 0} />
      </div>
    </div>
  );
}

function SectionColumn({
  section,
  index,
  count,
  sections,
  onMoveSection,
  onMoveLesson,
  onDeleteSection,
  onDeleteLesson,
}: {
  section: BoardSection;
  index: number;
  count: number;
  sections: BoardSection[];
  onMoveSection: (id: string, direction: Direction) => void;
  onMoveLesson: (id: string, direction: Direction) => void;
  onDeleteSection: () => Promise<ActionState<unknown>>;
  onDeleteLesson: (id: string) => Promise<ActionState<unknown>>;
}) {
  const [renaming, setRenaming] = useState(false);
  const seconds = section.lessons.reduce((sum, lesson) => sum + lesson.durationSeconds, 0);
  const headingId = `section-${section.id}`;

  return (
    <section className={styles.column} data-flip={`section-${section.id}`} aria-labelledby={headingId}>
      <header className={styles.columnHead}>
        <span className={styles.columnIndex} aria-hidden>
          {index + 1}
        </span>
        {renaming ? (
          <RenameSection section={section} onDone={() => setRenaming(false)} />
        ) : (
          <div className={styles.columnTitleWrap}>
            <h3 id={headingId} className={styles.columnTitle}>
              <span className={ui.srOnly}>섹션 {index + 1}. </span>
              {section.title}
            </h3>
            <p className={styles.columnMeta}>
              레슨 {section.lessons.length}개 · {formatRuntime(seconds)}
            </p>
          </div>
        )}
      </header>
      {!renaming ? (
        <div className={styles.columnTools}>
          <button type="button" className={ui.iconButton} onClick={() => setRenaming(true)} aria-label={`${section.title} 이름 바꾸기`}>
            <Pencil size={15} aria-hidden />
          </button>
          <button
            type="button"
            className={ui.iconButton}
            disabled={index === 0}
            onClick={() => onMoveSection(section.id, "up")}
            aria-label={`${section.title} 섹션을 앞으로`}
          >
            <ArrowLeft size={15} aria-hidden className={styles.wideOnly} />
            <ArrowUp size={15} aria-hidden className={styles.narrowOnly} />
          </button>
          <button
            type="button"
            className={ui.iconButton}
            disabled={index === count - 1}
            onClick={() => onMoveSection(section.id, "down")}
            aria-label={`${section.title} 섹션을 뒤로`}
          >
            <ArrowRight size={15} aria-hidden className={styles.wideOnly} />
            <ArrowDown size={15} aria-hidden className={styles.narrowOnly} />
          </button>
          <ConfirmButton
            run={onDeleteSection}
            label=""
            confirmLabel="섹션 삭제"
            prompt={section.lessons.length > 0 ? `레슨 ${section.lessons.length}개도 지워져요.` : "빈 섹션을 지울까요?"}
            icon={<Trash2 size={15} aria-hidden />}
            triggerLabel={`${section.title} 섹션 삭제`}
            className={clsx(ui.iconButton, styles.dangerIcon)}
          />
        </div>
      ) : null}

      {section.lessons.length === 0 ? (
        <p className={styles.emptyColumn}>아직 레슨이 없어요. 아래에서 첫 레슨을 추가하세요.</p>
      ) : (
        <ol role="list" className={styles.stack}>
          {section.lessons.map((lesson, lessonIndex) => (
            <LessonBlock
              key={lesson.id}
              lesson={lesson}
              sectionId={section.id}
              sections={sections}
              first={lessonIndex === 0}
              last={lessonIndex === section.lessons.length - 1}
              onMove={(direction) => onMoveLesson(lesson.id, direction)}
              onDelete={() => onDeleteLesson(lesson.id)}
            />
          ))}
        </ol>
      )}
      <AddLesson sectionId={section.id} sectionTitle={section.title} />
    </section>
  );
}

function LessonBlock({
  lesson,
  sectionId,
  sections,
  first,
  last,
  onMove,
  onDelete,
}: {
  lesson: BoardLesson;
  sectionId: string;
  sections: BoardSection[];
  first: boolean;
  last: boolean;
  onMove: (direction: Direction) => void;
  onDelete: () => Promise<ActionState<unknown>>;
}) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <li className={styles.lessonEditing} data-flip={lesson.id}>
        <LessonForm lesson={lesson} sectionId={sectionId} sections={sections} onDone={() => setEditing(false)} />
      </li>
    );
  }
  return (
    <li
      className={styles.lesson}
      data-flip={lesson.id}
      data-type={lesson.type}
      style={{ "--m": toMinutes(lesson.durationSeconds) } as React.CSSProperties}
    >
      <span className={styles.lessonMeta}>
        <LessonTypeIcon type={lesson.type} />
        {lessonTypeLabel(lesson.type)} · <time>{formatClock(lesson.durationSeconds)}</time>
      </span>
      <span className={styles.lessonTitle}>{lesson.title}</span>
      {lesson.isPreview ? <span className={styles.previewTag}>미리보기</span> : null}
      <span className={styles.lessonTools}>
        <button type="button" className={styles.blockButton} disabled={first} onClick={() => onMove("up")} aria-label={`${lesson.title} 위로`}>
          <ArrowUp size={14} aria-hidden />
        </button>
        <button type="button" className={styles.blockButton} disabled={last} onClick={() => onMove("down")} aria-label={`${lesson.title} 아래로`}>
          <ArrowDown size={14} aria-hidden />
        </button>
        <button type="button" className={styles.blockButton} onClick={() => setEditing(true)} aria-label={`${lesson.title} 편집`}>
          <Pencil size={14} aria-hidden />
        </button>
        <ConfirmButton
          run={onDelete}
          label=""
          confirmLabel="삭제"
          prompt="레슨을 지울까요?"
          icon={<Trash2 size={14} aria-hidden />}
          triggerLabel={`${lesson.title} 삭제`}
          className={styles.blockButton}
        />
      </span>
    </li>
  );
}

function LessonFields({
  prefix,
  state,
  lesson,
}: {
  prefix: string;
  state: ActionState<unknown>;
  lesson?: BoardLesson;
}) {
  const id = (name: string) => `${prefix}-${name}`;
  return (
    <>
      <div className={ui.field}>
        <label className={ui.label} htmlFor={id("title")}>
          레슨 제목
        </label>
        <input className={ui.input} {...fieldAttrs(state, "title", id("title"))} defaultValue={lesson?.title} maxLength={80} placeholder="예: useState 훅" />
        <FieldMessage state={state} name="title" id={id("title")} />
      </div>
      <div className={styles.pair}>
        <div className={ui.field}>
          <label className={ui.label} htmlFor={id("type")}>
            유형
          </label>
          <select className={ui.select} {...fieldAttrs(state, "type", id("type"))} defaultValue={lesson?.type ?? "video"}>
            {LESSON_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className={ui.field}>
          <label className={ui.label} htmlFor={id("duration")}>
            길이
          </label>
          <input
            className={ui.input}
            {...fieldAttrs(state, "duration", id("duration"), id("duration-hint"))}
            defaultValue={lesson ? formatClock(lesson.durationSeconds) : ""}
            placeholder="15:30"
            inputMode="numeric"
          />
        </div>
      </div>
      <p id={id("duration-hint")} className={ui.hint}>
        분:초(15:30) 또는 분(15)으로 적어요.
      </p>
      <FieldMessage state={state} name="duration" id={id("duration")} />
      <label className={ui.check}>
        <input type="checkbox" name="isPreview" defaultChecked={lesson?.isPreview} />
        무료 미리보기로 공개
      </label>
    </>
  );
}

function LessonForm({
  lesson,
  sectionId,
  sections,
  onDone,
}: {
  lesson: BoardLesson;
  sectionId: string;
  sections: BoardSection[];
  onDone: () => void;
}) {
  const { state, pending, formProps } = useFormAction(async (prev: ActionState<undefined>, data: FormData) => {
    const result = await updateLessonAction(prev, data);
    if (result.status === "success") onDone();
    return result;
  });
  const prefix = `edit-${lesson.id}`;
  return (
    <form {...formProps} className={styles.inlineForm} aria-label={`${lesson.title} 편집`}>
      <input type="hidden" name="lessonId" value={lesson.id} />
      <LessonFields prefix={prefix} state={state} lesson={lesson} />
      <div className={ui.field}>
        <label className={ui.label} htmlFor={`${prefix}-section`}>
          섹션
        </label>
        <select className={ui.select} id={`${prefix}-section`} name="sectionId" defaultValue={sectionId}>
          {sections.map((section, index) => (
            <option key={section.id} value={section.id}>
              {index + 1}. {section.title}
            </option>
          ))}
        </select>
      </div>
      <FormNotice state={state.status === "error" ? state : { status: "idle" }} />
      <div className={ui.formActions}>
        <SubmitButton pending={pending} pendingLabel="저장하는 중" className={ui.small}>
          저장
        </SubmitButton>
        <button type="button" className={clsx(ui.button, ui.small, ui.ghost)} onClick={onDone}>
          취소
        </button>
      </div>
    </form>
  );
}

function AddLesson({ sectionId, sectionTitle }: { sectionId: string; sectionTitle: string }) {
  const [open, setOpen] = useState(false);
  const { state, pending, formProps } = useFormAction(addLessonAction, { resetOnSuccess: true });
  if (!open) {
    return (
      <button type="button" className={styles.addSlot} onClick={() => setOpen(true)}>
        <Plus size={15} aria-hidden />
        레슨 추가
      </button>
    );
  }
  return (
    <form {...formProps} className={clsx(styles.inlineForm, styles.addForm)} aria-label={`${sectionTitle}에 레슨 추가`}>
      <input type="hidden" name="sectionId" value={sectionId} />
      <LessonFields prefix={`add-${sectionId}`} state={state} />
      <FormNotice state={state} />
      <div className={ui.formActions}>
        <SubmitButton pending={pending} pendingLabel="추가하는 중" className={ui.small} icon={<Plus size={14} aria-hidden />}>
          추가
        </SubmitButton>
        <button type="button" className={clsx(ui.button, ui.small, ui.ghost)} onClick={() => setOpen(false)}>
          <X size={14} aria-hidden />
          닫기
        </button>
      </div>
    </form>
  );
}

function RenameSection({ section, onDone }: { section: BoardSection; onDone: () => void }) {
  const { state, pending, formProps } = useFormAction(async (prev: ActionState<undefined>, data: FormData) => {
    const result = await renameSectionAction(prev, data);
    if (result.status === "success") onDone();
    return result;
  });
  const id = `rename-${section.id}`;
  return (
    <form {...formProps} className={styles.renameForm}>
      <input type="hidden" name="sectionId" value={section.id} />
      <label className={ui.srOnly} htmlFor={id}>
        섹션 이름
      </label>
      <input className={ui.input} {...fieldAttrs(state, "title", id)} defaultValue={section.title} maxLength={60} autoFocus />
      <FieldMessage state={state} name="title" id={id} />
      <div className={ui.formActions}>
        <SubmitButton pending={pending} pendingLabel="저장 중" className={ui.small}>
          저장
        </SubmitButton>
        <button type="button" className={clsx(ui.button, ui.small, ui.ghost)} onClick={onDone}>
          취소
        </button>
      </div>
    </form>
  );
}

function AddSection({ courseId, first }: { courseId: string; first: boolean }) {
  const [open, setOpen] = useState(first);
  const { state, pending, formProps } = useFormAction(addSectionAction, { resetOnSuccess: true });
  return (
    <div className={styles.addColumn}>
      {open ? (
        <form {...formProps} className={styles.inlineForm} aria-label="섹션 추가">
          <input type="hidden" name="courseId" value={courseId} />
          <div className={ui.field}>
            <label className={ui.label} htmlFor="new-section-title">
              {first ? "첫 섹션 이름" : "새 섹션 이름"}
            </label>
            <input
              className={ui.input}
              {...fieldAttrs(state, "title", "new-section-title")}
              placeholder="예: 기초 다지기"
              maxLength={60}
            />
            <FieldMessage state={state} name="title" id="new-section-title" />
          </div>
          <FormNotice state={state.status === "error" ? state : { status: "idle" }} />
          <div className={ui.formActions}>
            <SubmitButton pending={pending} pendingLabel="추가하는 중" className={ui.small} icon={<Plus size={14} aria-hidden />}>
              섹션 추가
            </SubmitButton>
            {!first ? (
              <button type="button" className={clsx(ui.button, ui.small, ui.ghost)} onClick={() => setOpen(false)}>
                닫기
              </button>
            ) : null}
          </div>
        </form>
      ) : (
        <button type="button" className={styles.addColumnButton} onClick={() => setOpen(true)}>
          <Plus size={18} aria-hidden />
          섹션 추가
        </button>
      )}
    </div>
  );
}

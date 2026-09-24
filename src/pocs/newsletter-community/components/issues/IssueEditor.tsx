"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft, Bold, Heading2, Link2, List, Quote, Scissors, Send, Trash2 } from "lucide-react";
import { formatNumber } from "@/core/format";
import { CATEGORIES, CATEGORY_LABEL, characterCount, manuscriptSheets, readingMinutes, type Category } from "../../domain/issues";
import { parseMarkup, previewBlocks } from "../../domain/markup";
import { AUDIENCE_LABEL, AUDIENCES, type Audience } from "../../domain/tiers";
import { removeIssue, saveIssue } from "../../server/actions";
import { IssueBody } from "../issue/IssueBody";
import { IssueCoverBand } from "../issue/IssueCoverBand";
import { dayAndTime, won, shortDate } from "../format";
import { buttonClass } from "../ui/button";
import { ConfirmAction } from "../ui/ConfirmAction";
import { FormMessage } from "../ui/FormMessage";
import { useToast } from "../ui/Toaster";
import { useFormSubmit } from "../ui/useFormSubmit";
import ui from "../ui/ui.module.css";
import { StatusTag } from "./StatusTag";
import styles from "./editor.module.css";

export interface EditableIssue {
  id: string;
  number: number | null;
  title: string;
  lede: string;
  body: string;
  category: Category;
  audience: Audience;
  status: "draft" | "scheduled" | "published";
  scheduledAt: Date | null;
  publishedAt: Date | null;
}

export interface SponsorOption {
  id: string;
  sponsorName: string;
  message: string;
  amount: number;
  runOn: string;
  issueId: string | null;
}

interface IssueEditorProps {
  issue: EditableIssue | null;
  recipients: Record<Audience, number>;
  sponsorOptions: SponsorOption[];
  nextNumber: number;
  defaultSchedule: { date: string; time: string };
  initialView: "write" | "proof";
  /** The intent that just completed before a redirect here (new issues). */
  done?: string;
}

const DONE_MESSAGES: Record<string, string> = {
  save: "새 호를 초안으로 저장했어요.",
  schedule: "새 호를 저장하고 발행을 예약했어요.",
  publish: "새 호를 발행했어요. 아래에서 발송 기록을 확인하세요.",
};

type View = "write" | "proof";

type ToolKind = "bold" | "heading" | "list" | "quote" | "link" | "cut";

const TOOLS: { kind: ToolKind; label: string; icon: typeof Bold }[] = [
  { kind: "bold", label: "굵게", icon: Bold },
  { kind: "heading", label: "소제목", icon: Heading2 },
  { kind: "list", label: "목록", icon: List },
  { kind: "quote", label: "인용", icon: Quote },
  { kind: "link", label: "링크", icon: Link2 },
  { kind: "cut", label: "미리보기 끝", icon: Scissors },
];

export function IssueEditor({ issue, recipients, sponsorOptions, nextNumber, defaultSchedule, initialView, done }: IssueEditorProps) {
  const [title, setTitle] = useState(issue?.title ?? "");
  const [lede, setLede] = useState(issue?.lede ?? "");
  const [body, setBody] = useState(issue?.body ?? "");
  const [category, setCategory] = useState<Category>(issue?.category ?? "tech");
  const [audience, setAudience] = useState<Audience>(issue?.audience ?? "everyone");
  const [sponsorshipId, setSponsorshipId] = useState(sponsorOptions.find((s) => s.issueId && s.issueId === issue?.id)?.id ?? "");
  const [view, setView] = useState<View>(initialView);
  const [saved, setSaved] = useState(() => ({ title, lede, body, category, audience, sponsorshipId }));
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const publishDialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const { show } = useToast();
  const { state, pending, formRef, onSubmit, action, fieldError } = useFormSubmit(saveIssue, { toast: true });

  const published = issue?.status === "published";
  const number = issue?.number ?? nextNumber;
  const current = { title, lede, body, category, audience, sponsorshipId };
  const dirty = (Object.keys(saved) as (keyof typeof saved)[]).some((key) => saved[key] !== current[key]);

  // After a successful save the current text becomes the saved baseline.
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state.status === "success") setSaved(current);
  }

  const announced = useRef(false);
  useEffect(() => {
    if (announced.current || !done || !DONE_MESSAGES[done]) return;
    announced.current = true;
    show(DONE_MESSAGES[done]);
    // Drop ?done= without a navigation (a router round-trip here could swallow an action started meanwhile).
    window.history.replaceState(null, "", pathname);
  }, [done, show, pathname]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const blocks = useMemo(() => parseMarkup(body), [body]);
  const previewLength = audience === "everyone" ? undefined : previewBlocks(blocks).length;
  const sponsor = sponsorOptions.find((s) => s.id === sponsorshipId);
  const characters = characterCount(body);

  /** Wraps the selection (or inserts at the caret) in the textarea, keeping the caret sensible. */
  const edit = (transform: (selected: string) => { text: string; caret?: number }, lineStart = false) => {
    const area = bodyRef.current;
    if (!area) return;
    let start = area.selectionStart;
    const end = area.selectionEnd;
    if (lineStart) start = body.lastIndexOf("\n", start - 1) + 1;
    const { text, caret } = transform(body.slice(start, end));
    const next = body.slice(0, start) + text + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      area.focus();
      const position = start + (caret ?? text.length);
      area.setSelectionRange(position, position);
    });
  };

  const applyTool = (tool: ToolKind) => {
    switch (tool) {
      case "bold":
        return edit((s) => ({ text: `**${s || "강조할 말"}**`, caret: s ? undefined : 2 }));
      case "heading":
        return edit((s) => ({ text: `## ${s.replace(/^#+\s*/, "")}` }), true);
      case "list":
        return edit((s) => ({ text: s.split("\n").map((line) => `- ${line.replace(/^[-*]\s*/, "")}`).join("\n") }), true);
      case "quote":
        return edit((s) => ({ text: `> ${s.replace(/^>\s*/, "")}` }), true);
      case "link":
        return edit((s) => ({ text: `[${s || "링크 글자"}](https://)`, caret: (s || "링크 글자").length + 11 }));
      case "cut":
        return edit(() => ({ text: "\n\n---\n\n" }));
    }
  };

  const onBodyKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
      event.preventDefault();
      applyTool("bold");
    }
  };

  const onFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      formRef.current?.querySelector<HTMLButtonElement>('button[value="save"]')?.click();
    }
  };

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={onSubmit}
      onKeyDown={onFormKeyDown}
      className={styles.editor}
      aria-label={issue ? `제${number}호 편집` : "새 호 쓰기"}
    >
      {issue && <input type="hidden" name="id" value={issue.id} />}

      <div className={styles.topbar}>
        <Link href="/newsletter-community/issues" className={buttonClass("quiet", "sm")}>
          <ArrowLeft size={16} aria-hidden />
          발행 목록
        </Link>
        <div className={styles.topbarState}>
          {issue ? <StatusTag status={issue.status} /> : <span className={clsx(ui.tag, ui.tagDashed)}>새 초안</span>}
          <span className={clsx(styles.saveState, dirty && styles.saveStateDirty)} aria-live="polite">
            {pending ? "저장 중…" : dirty ? "저장하지 않은 변경" : issue ? "저장됨" : "아직 저장 전"}
          </span>
        </div>
        <div className={styles.viewSwitch} role="group" aria-label="보기">
          <button type="button" aria-pressed={view === "write"} onClick={() => setView("write")}>
            원고
          </button>
          <button type="button" aria-pressed={view === "proof"} onClick={() => setView("proof")}>
            교정쇄
          </button>
        </div>
      </div>

      <div className={styles.columns}>
        <div className={styles.sheet}>
          <div className={styles.manuscript} hidden={view !== "write"}>
            <label className={ui.srOnly} htmlFor="issue-title">
              제목
            </label>
            <input
              id="issue-title"
              name="title"
              className={styles.titleInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목"
              maxLength={120}
              required
              aria-invalid={fieldError("title") ? true : undefined}
              aria-describedby={fieldError("title") ? "issue-title-error" : undefined}
            />
            {fieldError("title") && (
              <p id="issue-title-error" className={ui.error}>
                {fieldError("title")}
              </p>
            )}
            <label className={ui.srOnly} htmlFor="issue-lede">
              소개 문장
            </label>
            <textarea
              id="issue-lede"
              name="lede"
              className={styles.ledeInput}
              value={lede}
              onChange={(e) => setLede(e.target.value)}
              placeholder="한두 문장으로 이 호를 소개해 주세요. 목차와 메일 미리보기에 쓰여요."
              rows={2}
              maxLength={200}
              aria-invalid={fieldError("lede") ? true : undefined}
            />

            <div className={styles.toolbar} role="toolbar" aria-label="서식" aria-controls="issue-body">
              {TOOLS.map((tool) => (
                <button key={tool.kind} type="button" className={styles.tool} onClick={() => applyTool(tool.kind)} title={tool.label}>
                  <tool.icon size={16} aria-hidden />
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
            <label className={ui.srOnly} htmlFor="issue-body">
              본문
            </label>
            <textarea
              ref={bodyRef}
              id="issue-body"
              name="body"
              className={styles.bodyInput}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={onBodyKeyDown}
              placeholder={"본문을 쓰세요.\n\n## 소제목, - 목록, > 인용, **굵게**, [링크](https://…)를 쓸 수 있어요.\n유료 호는 --- 줄 앞까지만 무료로 보여요."}
              aria-describedby="issue-count"
            />
            <p id="issue-count" className={styles.count}>
              원고지 <strong>{manuscriptSheets(body)}</strong>매 · {formatNumber(characters)}자 · 읽는 데 약 {readingMinutes(body)}분
            </p>
          </div>

          {view === "proof" && (
            <div className={styles.proof} aria-label="교정쇄">
              <IssueCoverBand
                number={number}
                pending={!issue?.number}
                title={title}
                lede={lede}
                headingLevel="h2"
                meta={
                  <>
                    <span>{CATEGORY_LABEL[category]}</span>
                    <span>{AUDIENCE_LABEL[audience]}</span>
                    <span>
                      {issue?.publishedAt
                        ? `${shortDate(issue.publishedAt)} 발행`
                        : issue?.scheduledAt
                          ? `${dayAndTime(issue.scheduledAt)} 발행 예정`
                          : "발행 전"}
                    </span>
                  </>
                }
              />
              {blocks.length === 0 ? (
                <p className={styles.proofEmpty}>본문이 비어 있어요. 원고에서 첫 문단을 써 보세요.</p>
              ) : (
                <IssueBody
                  blocks={blocks}
                  markerAfter={previewLength}
                  marker={
                    <p className={styles.previewMarker}>
                      <Scissors size={14} aria-hidden />
                      여기까지 무료로 보여요 · 이 아래는 {AUDIENCE_LABEL[audience]}만
                    </p>
                  }
                />
              )}
              {sponsor && (
                <aside className={styles.proofSponsor}>
                  <span className={ui.tag}>광고</span>
                  <strong>{sponsor.sponsorName}</strong> {sponsor.message}
                </aside>
              )}
            </div>
          )}
        </div>

        <aside className={styles.panel} aria-label="발행 설정">
          <fieldset className={styles.group}>
            <legend className={styles.legend}>꼭지</legend>
            <select
              name="category"
              className={ui.select}
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              aria-label="꼭지"
            >
              {CATEGORIES.map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_LABEL[key]}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className={styles.group} disabled={published}>
            <legend className={styles.legend}>받는 사람</legend>
            {AUDIENCES.map((key) => (
              <label key={key} className={styles.choice}>
                <input
                  type="radio"
                  name="audience"
                  value={key}
                  checked={audience === key}
                  onChange={() => setAudience(key)}
                />
                <span>{AUDIENCE_LABEL[key]}</span>
                <span className={styles.choiceCount}>{formatNumber(recipients[key])}명</span>
              </label>
            ))}
            {published && <p className={ui.hint}>이미 보낸 호는 받는 사람을 바꿀 수 없어요.</p>}
          </fieldset>
          {published && <input type="hidden" name="audience" value={audience} />}

          <fieldset className={styles.group}>
            <legend className={styles.legend}>광고 지면</legend>
            <select
              name="sponsorshipId"
              className={ui.select}
              value={sponsorshipId}
              onChange={(e) => setSponsorshipId(e.target.value)}
              aria-label="광고 지면"
            >
              <option value="">광고 없음</option>
              {sponsorOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.sponsorName} · {shortDate(option.runOn)} · {won(option.amount)}
                </option>
              ))}
            </select>
            <p className={ui.hint}>수입 장부에 적은 광고 계약 중 아직 실리지 않은 것만 골라요.</p>
          </fieldset>

          {!published && (
            <fieldset className={styles.group}>
              <legend className={styles.legend}>발행 예약</legend>
              <div className={styles.scheduleRow}>
                <label className={ui.srOnly} htmlFor="schedule-date">
                  예약 날짜
                </label>
                <input
                  id="schedule-date"
                  type="date"
                  name="scheduleDate"
                  className={ui.input}
                  defaultValue={defaultSchedule.date}
                  aria-invalid={fieldError("scheduleDate") ? true : undefined}
                  aria-describedby={fieldError("scheduleDate") ? "schedule-error" : undefined}
                />
                <label className={ui.srOnly} htmlFor="schedule-time">
                  예약 시각
                </label>
                <input id="schedule-time" type="time" name="scheduleTime" className={ui.input} defaultValue={defaultSchedule.time} step={300} />
              </div>
              {fieldError("scheduleDate") && (
                <p id="schedule-error" className={ui.error}>
                  {fieldError("scheduleDate")}
                </p>
              )}
              {issue?.status === "scheduled" && issue.scheduledAt && (
                <p className={ui.hint}>지금은 {dayAndTime(issue.scheduledAt)}에 발행하도록 예약되어 있어요.</p>
              )}
            </fieldset>
          )}

          <div className={styles.actions}>
            <button type="submit" name="intent" value="save" className={buttonClass("secondary")} disabled={pending}>
              {published ? "고친 내용 저장" : "원고 저장"}
            </button>
            {!published && (
              <button type="submit" name="intent" value="schedule" className={buttonClass("secondary")} disabled={pending}>
                {issue?.status === "scheduled" ? "예약 바꾸기" : "예약 발행"}
              </button>
            )}
            {issue?.status === "scheduled" && (
              <button type="submit" name="intent" value="unschedule" className={buttonClass("quiet")} disabled={pending}>
                예약 풀기
              </button>
            )}
            {!published && (
              <button type="button" className={buttonClass("primary")} disabled={pending} onClick={() => publishDialog.current?.showModal()}>
                <Send size={16} aria-hidden />
                지금 발행
              </button>
            )}
          </div>
          <FormMessage state={state} showSuccess={false} />

          {issue && !published && (
            <div className={styles.danger}>
              <ConfirmAction
                variant="danger"
                title="이 초안을 지울까요?"
                description={`‘${issue.title}’을(를) 지우면 되돌릴 수 없어요. 광고 지면에 올린 광고는 다시 미정으로 돌아가요.`}
                confirmLabel="초안 지우기"
                run={() => removeIssue({ id: issue.id })}
              >
                <Trash2 size={15} aria-hidden />
                초안 지우기
              </ConfirmAction>
            </div>
          )}

          <dialog ref={publishDialog} className={ui.dialog} aria-labelledby="publish-title">
            <div className={ui.dialogBody}>
              <h2 id="publish-title" className={ui.dialogTitle}>
                제{number}호를 지금 보낼까요?
              </h2>
              <p className={ui.dialogText}>
                {AUDIENCE_LABEL[audience]} <strong>{formatNumber(recipients[audience])}명</strong>에게 발송 기록을 남기고 아카이브에
                공개해요. 보낸 뒤에는 받는 사람을 바꿀 수 없어요.
                {dirty && " 저장하지 않은 변경도 함께 저장돼요."}
              </p>
              <p className={ui.hint}>데모라서 실제 이메일은 나가지 않아요. 오픈·클릭은 시뮬레이션으로 채워져요.</p>
              <div className={ui.dialogActions}>
                <button type="button" className={buttonClass("secondary")} onClick={() => publishDialog.current?.close()} autoFocus>
                  그만두기
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="publish"
                  className={buttonClass("primary")}
                  onClick={() => publishDialog.current?.close()}
                >
                  <Send size={16} aria-hidden />
                  발행하기
                </button>
              </div>
            </div>
          </dialog>
        </aside>
      </div>
    </form>
  );
}

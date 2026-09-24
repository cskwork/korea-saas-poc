"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import type { ActionState } from "@/core/actions";
import { formatDate, formatTime } from "@/core/format";
import {
  cutStarts,
  formatDuration,
  storyboardDuration,
  type BriefConcept,
  type StoryboardCut,
} from "../../domain/brief";
import { ORDER_TYPE_INFO, type OrderType } from "../../domain/catalog";
import { deleteBriefAction, generateBriefAction } from "../../server/actions";
import { Frame } from "../frame/Frame";
import { ConfirmButton } from "../ui/ConfirmButton";
import { FormStatus } from "../ui/FormStatus";
import ui from "../ui.module.css";
import styles from "./brief-panel.module.css";

export interface BriefView {
  id: string;
  source: "claude" | "template";
  concepts: BriefConcept[];
  copyLines: string[];
  storyboard: StoryboardCut[];
  createdAt: Date;
}

interface BriefPanelProps {
  orderId: string;
  type: OrderType;
  briefs: BriefView[];
}

/** The AI brief assistant: concept directions, copy lines and a 콘티, attached to the order. */
export function BriefPanel({ orderId, type, briefs }: BriefPanelProps) {
  const latestId = briefs[0]?.id;
  const [view, setView] = useState({ latestId, selectedId: latestId, drawn: 0 });
  // A new version arriving from the server is selected and drawn in, cut by cut.
  if (view.latestId !== latestId) setView({ latestId, selectedId: latestId, drawn: view.drawn + 1 });

  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionState<unknown>>({ status: "idle" });
  const brief = briefs.find((b) => b.id === view.selectedId) ?? briefs[0];
  const isLatest = brief?.id === latestId;

  const generate = () =>
    startTransition(async () => {
      setResult(await generateBriefAction({ orderId }));
    });

  return (
    <section id="brief" className={styles.panel} aria-labelledby="brief-title" aria-busy={pending}>
      <div className={styles.head}>
        <div>
          <h2 id="brief-title" className={styles.title}>
            AI 콘티
          </h2>
          <p className={styles.lead}>
            요청 사항을 바탕으로 콘셉트 방향 3가지, 카피,{" "}
            {ORDER_TYPE_INFO[type].motion ? "컷별 콘티" : "시안·섹션 구성"}를 만들어요. 그대로 보내지 말고 작업 전
            초안으로 다듬어 쓰세요.
          </p>
        </div>
        <button type="button" className={ui.button} onClick={generate} disabled={pending} aria-busy={pending}>
          {pending ? <span className={ui.spinner} aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
          {pending ? "콘티를 그리는 중" : brief ? "새 버전 만들기" : "AI 콘티 만들기"}
        </button>
      </div>
      <FormStatus state={result} className={styles.status} />

      {briefs.length > 1 && (
        <div className={styles.versions} role="group" aria-label="콘티 버전">
          {briefs.map((b, i) => (
            <button
              key={b.id}
              type="button"
              className={styles.version}
              aria-pressed={b.id === brief?.id}
              onClick={() => setView({ ...view, selectedId: b.id })}
            >
              <span className={styles.versionNo}>v{briefs.length - i}</span>
              {formatDate(b.createdAt, { month: "numeric", day: "numeric" })} {formatTime(b.createdAt)}
            </button>
          ))}
        </div>
      )}

      {pending && !brief ? (
        <StoryboardSkeleton type={type} />
      ) : brief ? (
        <div className={styles.result} data-pending={pending || undefined}>
          <p className={styles.source}>
            <span className={styles.sourceTag} data-source={brief.source}>
              {brief.source === "claude" ? "Claude가 작성" : "기본 템플릿"}
            </span>
            {brief.source === "template" && "AI 키가 없거나 응답을 받지 못해 주문 내용으로 채운 기본 템플릿이에요. "}
            {formatDate(brief.createdAt, { month: "long", day: "numeric" })} {formatTime(brief.createdAt)} 생성
          </p>

          <h3 className={styles.subTitle}>콘셉트 방향</h3>
          <ol className={styles.concepts} role="list">
            {brief.concepts.map((concept, i) => (
              <li key={i} className={styles.concept}>
                <p className={styles.conceptTitle}>
                  <span className={styles.conceptNo}>{String.fromCharCode(65 + i)}</span>
                  {concept.title}
                </p>
                <p className={styles.conceptText}>{concept.description}</p>
                <p className={styles.keywords}>{concept.keywords.join(" · ")}</p>
                <ul className={styles.palette} role="list" aria-label={`${concept.title} 색상`}>
                  {concept.palette.map((color) => (
                    <li key={color} className={styles.swatch}>
                      <span className={styles.chip} style={{ background: color }} aria-hidden="true" />
                      {color.toUpperCase()}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <h3 className={styles.subTitle}>카피 후보</h3>
          <ol className={styles.copies} role="list">
            {brief.copyLines.map((line, i) => (
              <CopyLine key={`${brief.id}-${i}`} index={i} line={line} />
            ))}
          </ol>

          <h3 className={styles.subTitle}>{ORDER_TYPE_INFO[type].motion ? "콘티" : "시안·섹션 구성"}</h3>
          <Storyboard type={type} cuts={brief.storyboard} draw={isLatest && view.drawn > 0} drawKey={view.drawn} />

          <div className={styles.footer}>
            <ConfirmButton
              title="이 콘티 버전을 삭제할까요?"
              description="콘셉트, 카피, 콘티가 함께 지워져요. 주문 자체는 그대로 남아요."
              confirmLabel="콘티 삭제"
              onConfirm={() => deleteBriefAction({ briefId: brief.id })}
              onDone={setResult}
              buttonClassName={ui.quiet}
            >
              이 버전 삭제
            </ConfirmButton>
          </div>
        </div>
      ) : (
        <div className={ui.empty}>
          <p className={ui.emptyTitle}>아직 콘티가 없어요</p>
          <p className={ui.emptyText}>
            ‘AI 콘티 만들기’를 누르면 이 주문의 작업명과 요청 사항으로 콘셉트, 카피,{" "}
            {ORDER_TYPE_INFO[type].motion ? "컷 구성" : "시안 구성"}을 만들어 주문에 붙여 둬요. AI 키가 없어도 기본
            템플릿으로 바로 만들어져요.
          </p>
        </div>
      )}
    </section>
  );
}

function CopyLine({ index, line }: { index: number; line: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };
  return (
    <li className={styles.copy}>
      <span className={styles.copyNo}>{index + 1}</span>
      <span className={styles.copyText}>{line}</span>
      <span className={styles.copyCount}>{[...line].length}자</span>
      <button type="button" className={styles.copyButton} onClick={copy} aria-label={`카피 ${index + 1} 복사`}>
        {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
        <span aria-live="polite">{copied ? "복사됨" : "복사"}</span>
      </button>
    </li>
  );
}

function Storyboard({
  type,
  cuts,
  draw,
  drawKey,
}: {
  type: OrderType;
  cuts: StoryboardCut[];
  draw: boolean;
  drawKey: number;
}) {
  const info = ORDER_TYPE_INFO[type];
  const tall = info.frame.ratio[1] > info.frame.ratio[0];
  const total = storyboardDuration(cuts);
  const starts = cutStarts(cuts);
  return (
    <div className={styles.board} key={drawKey}>
      <div className={styles.boardHead} aria-hidden="true">
        <span>CUT</span>
        <span>화면</span>
        <span>내용</span>
        <span>자막·카피</span>
        <span>{info.motion ? "시간" : ""}</span>
      </div>
      <ol className={styles.cuts} role="list">
        {cuts.map((cut, i) => {
          const start = starts[i];
          return (
            <li key={i} className={styles.cut}>
              <span className={styles.cutNo}>{i + 1}</span>
              <div className={styles.cutFrame}>
                <Frame
                  type={type}
                  medium="pencil"
                  height={tall ? 176 : 108}
                  maxWidth={192}
                  headline={cut.caption}
                  inking={draw}
                  style={{ "--ink-delay": `${i * 90}ms` } as CSSProperties}
                />
              </div>
              <div className={styles.cutBody}>
                <p className={styles.cutLabel}>
                  {cut.label}
                  <span className={styles.shot}>{cut.shot}</span>
                </p>
                <p className={styles.cutVisual}>{cut.visual}</p>
              </div>
              <p className={styles.caption}>{cut.caption}</p>
              <p className={styles.seconds}>
                {cut.seconds !== null && (
                  <>
                    <span className={styles.secondsValue}>{cut.seconds}″</span>
                    <span className={styles.timecode}>{formatDuration(start)}</span>
                  </>
                )}
              </p>
            </li>
          );
        })}
      </ol>
      {total !== null && (
        <p className={styles.total}>
          총 길이 <strong>{formatDuration(total)}</strong> · {cuts.length}컷
        </p>
      )}
    </div>
  );
}

function StoryboardSkeleton({ type }: { type: OrderType }) {
  return (
    <div className={styles.board} aria-hidden="true">
      <ol className={styles.cuts} role="list">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className={`${styles.cut} ${styles.cutSkeleton}`}>
            <span className={styles.cutNo}>{i + 1}</span>
            <div className={styles.cutFrame}>
              <Frame
                type={type}
                medium="sketch"
                height={ORDER_TYPE_INFO[type].frame.ratio[1] > ORDER_TYPE_INFO[type].frame.ratio[0] ? 176 : 108}
                maxWidth={192}
              />
            </div>
            <div className={styles.cutBody}>
              <span className={styles.skLine} />
              <span className={styles.skLine} style={{ width: "60%" }} />
            </div>
            <span className={styles.skLine} />
            <span />
          </li>
        ))}
      </ol>
    </div>
  );
}

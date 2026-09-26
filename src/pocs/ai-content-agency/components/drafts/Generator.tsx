"use client";

import { FolderOpen, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import type { ActionState } from "@/core/actions";
import { formatNumber } from "@/core/format";
import {
  CONTENT_KINDS,
  KIND_HINT,
  KIND_LABEL,
  LENGTHS,
  LENGTH_LABEL,
  LENGTH_TARGET,
  TONES,
  TONE_LABEL,
  TOPIC_PLACEHOLDER,
  composeCopy,
  countCharacters,
  parseKeywords,
  type ContentKind,
  type Length,
  type Tone,
} from "../../domain/content";
import { orderCode } from "../../domain/pipeline";
import { generateDraftAction, regenerateDraftAction, type GeneratedDraft } from "../../server/actions";
import { BannerProof } from "../proof/BannerProof";
import { Grommets } from "../shell/Grommets";
import { buttonClass } from "../ui/buttons";
import { CopyButton } from "../ui/CopyButton";
import { Field, Segmented, describedBy } from "../ui/Field";
import { Notice } from "../ui/Notice";
import { PendingLabel } from "../ui/PendingLabel";
import { SourceTag } from "../ui/Tags";
import { focusFirstInvalid } from "../ui/useActionForm";
import ui from "../ui/ui.module.css";
import { DraftBody } from "./DraftBody";
import styles from "./drafts.module.css";

export interface OpenOrderOption {
  id: string;
  number: number;
  clientName: string;
  kind: ContentKind;
  topic: string;
  keywords: string[];
  tone: Tone;
  length: Length;
}

type Result = GeneratedDraft & { keywords: string[] };

const idle: ActionState<GeneratedDraft> = { status: "idle" };

/** 시안 쓰기: a brief on the left, the proof unrolling on the right. */
export function Generator({ orders, initialOrderId, aiMode }: { orders: OpenOrderOption[]; initialOrderId: string | null; aiMode: "claude" | "template" }) {
  const initial = orders.find((o) => o.id === initialOrderId) ?? null;
  const [orderId, setOrderId] = useState(initial?.id ?? "");
  const [kind, setKind] = useState<ContentKind>(initial?.kind ?? "blog");
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [keywords, setKeywords] = useState(initial?.keywords.join(", ") ?? "");
  const [tone, setTone] = useState<Tone>(initial?.tone ?? "friendly");
  const [length, setLength] = useState<Length>(initial?.length ?? "medium");
  const [notes, setNotes] = useState("");

  const [state, setState] = useState<ActionState<GeneratedDraft>>(idle);
  const [result, setResult] = useState<Result | null>(null);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const errorFor = (name: string) => (state.status === "error" ? state.fieldErrors?.[name]?.[0] : undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "error") focusFirstInvalid(formRef.current);
  }, [state]);

  const pickOrder = (id: string) => {
    setOrderId(id);
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    setKind(order.kind);
    setTopic(order.topic);
    setKeywords(order.keywords.join(", "));
    setTone(order.tone);
    setLength(order.length);
  };

  const generate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const next = await generateDraftAction(idle, formData);
      setState(next);
      setRewriteError(null);
      if (next.status === "success" && next.data) setResult({ ...next.data, keywords: parseKeywords(keywords) });
    });
  };

  const rewrite = () => {
    if (!result) return;
    const formData = new FormData();
    formData.set("draftId", result.draftId);
    formData.set("tone", tone);
    formData.set("length", length);
    formData.set("keywords", keywords);
    formData.set("notes", notes);
    startTransition(async () => {
      const next = await regenerateDraftAction({ status: "idle" }, formData);
      if (next.status === "error") {
        setRewriteError(next.message);
        return;
      }
      setRewriteError(null);
      if (next.status === "success" && next.data) {
        setResult({ ...result, ...next.data, keywords: parseKeywords(keywords) });
      }
    });
  };

  const client = orders.find((o) => o.id === orderId)?.clientName;

  return (
    <div className={styles.generator}>
      <form ref={formRef} className={styles.composer} onSubmit={generate} noValidate aria-label="시안 조건">
        <Field id="gen-order" label="의뢰 연결" optional hint="고르면 의뢰서 내용으로 채워지고, 접수 단계 의뢰는 작성중으로 옮겨져요.">
          <select
            id="gen-order"
            name="orderId"
            className={ui.select}
            value={orderId}
            onChange={(e) => pickOrder(e.target.value)}
            aria-describedby={describedBy("gen-order", { hint: true })}
          >
            <option value="">연결하지 않고 쓰기</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {orderCode(order.number)} {order.clientName} · {order.topic}
              </option>
            ))}
          </select>
        </Field>

        <Segmented
          name="kind"
          legend="콘텐츠 유형"
          options={CONTENT_KINDS}
          value={kind}
          onChange={setKind}
          error={errorFor("kind")}
          renderOption={(k) => (
            <>
              <span className={ui.swatch} data-kind={k} aria-hidden="true" />
              {KIND_LABEL[k].replace(" 포스트", "")}
            </>
          )}
        />
        <p className={styles.composerNote}>{KIND_HINT[kind]}</p>

        <Field id="gen-topic" label="주제" error={errorFor("topic")}>
          <input
            id="gen-topic"
            name="topic"
            className={ui.input}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={TOPIC_PLACEHOLDER[kind]}
            maxLength={80}
            aria-invalid={errorFor("topic") ? true : undefined}
            aria-describedby={describedBy("gen-topic", { error: errorFor("topic") })}
            required
          />
        </Field>
        <Field id="gen-keywords" label="키워드" optional hint="쉼표로 나눠 주세요. 첫 키워드가 제목에 들어가요." error={errorFor("keywords")}>
          <input
            id="gen-keywords"
            name="keywords"
            className={ui.input}
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="예: 소금빵, 성수동 빵집"
            aria-describedby={describedBy("gen-keywords", { hint: true, error: errorFor("keywords") })}
          />
        </Field>
        <Segmented name="tone" legend="말투" options={TONES} value={tone} onChange={setTone} renderOption={(t) => TONE_LABEL[t]} />
        <Segmented
          name="length"
          legend="분량"
          options={LENGTHS}
          value={length}
          onChange={setLength}
          renderOption={(l) => `${LENGTH_LABEL[l]} · ${formatNumber(LENGTH_TARGET[kind][l])}자`}
        />
        <Field id="gen-notes" label="추가 요청" optional hint="예: 가격은 쓰지 말기, 마지막에 예약 안내 넣기" error={errorFor("notes")}>
          <textarea
            id="gen-notes"
            name="notes"
            className={ui.textarea}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            aria-describedby={describedBy("gen-notes", { hint: true, error: errorFor("notes") })}
          />
        </Field>

        {state.status === "error" ? <Notice tone="error">{state.message}</Notice> : null}
        <button type="submit" className={buttonClass("primary")} disabled={pending} data-pending={pending}>
          <PendingLabel pending={pending} idle="시안 쓰기" busy="시안 쓰는 중…" icon={<Sparkles size={18} aria-hidden="true" />} />
        </button>
        <p className={styles.composerNote}>
          {aiMode === "claude"
            ? "Claude가 쓰고, 쓴 시안은 원고함에 저장돼요. 보통 10–30초 걸려요."
            : "API 키가 없어 기본 템플릿이 써요. 구조와 키워드는 맞추고, 사실은 [확인 필요]로 비워 둬요."}
        </p>
      </form>

      <section className={styles.result} aria-live="polite" aria-busy={pending} aria-label="시안">
        {pending ? (
          <div className={styles.skeleton} aria-label="시안을 쓰는 중">
            <div className={styles.skeletonProof} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
          </div>
        ) : result ? (
          <>
            <BannerProof
              key={`${result.draftId}-${result.version}`}
              title={result.title}
              kind={result.kind}
              keywords={result.keywords}
              byline={client ? `${client} · ${KIND_LABEL[result.kind]} 시안 v${result.version}` : `${KIND_LABEL[result.kind]} 시안 v${result.version}`}
              unfurl
            />
            <div className={styles.resultBar}>
              <span className={styles.resultMeta}>
                <SourceTag source={result.source} />
                <span>{formatNumber(countCharacters(result.body).withSpaces)}자</span>
                <span>원고함에 저장됨</span>
              </span>
              <span className={styles.resultActions}>
                <Link href={`/ai-content-agency/drafts/${result.draftId}`} className={buttonClass("secondary")}>
                  <FolderOpen size={16} aria-hidden="true" />
                  원고 열기
                </Link>
                <CopyButton text={composeCopy(result.title, result.body)} />
                <button type="button" className={buttonClass("quiet")} onClick={rewrite}>
                  <RefreshCw size={16} aria-hidden="true" />
                  다시 쓰기
                </button>
              </span>
            </div>
            {result.notice ? <Notice tone="info">{result.notice}</Notice> : null}
            {rewriteError ? <Notice tone="error">{rewriteError}</Notice> : null}
            <div className={styles.document}>
              <DraftBody body={result.body} />
            </div>
          </>
        ) : (
          <>
            <div className={styles.placeholder}>
              <Grommets className={styles.grommets} />
              왼쪽 조건을 채우고 시안 쓰기를 누르면, 여기에 시안이 걸려요.
            </div>
            <div className={styles.tips}>
              <strong>잘 나오는 조건</strong>
              <ul>
                <li>주제는 누가 무엇을 파는지 드러나게: “성수동 소금빵 맛집”보다 “새벽에 굽는 성수동 소금빵”.</li>
                <li>키워드는 고객이 실제로 검색할 말로 두세 개.</li>
                <li>AI는 가격·수치·후기를 지어내지 않고 [확인 필요]로 남겨요. 검수 때 채워 주세요.</li>
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

"use client";

import { ArrowDown, ArrowUp, Plus, Sparkles, Undo2, X } from "lucide-react";
import { useActionState, useId, useRef, useState, useTransition } from "react";
import { idleState } from "@/core/actions";
import { formatWon } from "@/core/format";
import { TAX_MODE_HINT, TAX_MODE_LABEL } from "../../domain/labels";
import { computeTotals, lineAmount, type LineItem, type LineUnit, type TaxMode } from "../../domain/money";
import { draftEstimate, saveEstimate, saveInvoice, type EstimateDraftResult } from "../../server/actions";
import type { ClientOption } from "../../server/data/clients";
import { buttonClass } from "../ui/button";
import { Field } from "../ui/Field";
import { FormMessage } from "../ui/FormMessage";
import { SubmitButton } from "../ui/SubmitButton";
import ui from "../ui/ui.module.css";
import styles from "./DocumentEditor.module.css";
import { PaperSheet, type SheetSupplier } from "./PaperSheet";

export interface EditorDraft {
  id?: string;
  number?: string;
  clientId: string | null;
  projectId: string | null;
  title: string;
  taxMode: TaxMode;
  discount: number;
  issuedOn: string;
  deadline: string;
  notes: string;
  items: LineItem[];
}

interface Row extends LineItem {
  key: number;
}

const withKey = (item: LineItem, key: number): Row => ({ ...item, key });

interface DocumentEditorProps {
  kind: "estimate" | "invoice";
  initial: EditorDraft;
  clients: ClientOption[];
  projects: { id: string; title: string; clientId: string | null }[];
  supplier: SheetSupplier;
  hourlyRate: number;
}

/**
 * The estimate / invoice builder: line items by feature (hours × rate or a lump sum), discount and the
 * tax choice, with the paper document redrawn live beside the form.
 */
export function DocumentEditor({ kind, initial, clients, projects, supplier, hourlyRate }: DocumentEditorProps) {
  const [state, formAction] = useActionState(kind === "estimate" ? saveEstimate : saveInvoice, idleState);
  const uid = useId();
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  const [clientId, setClientId] = useState(initial.clientId ?? "");
  const [projectId, setProjectId] = useState(initial.projectId ?? "");
  const [title, setTitle] = useState(initial.title);
  const [taxMode, setTaxMode] = useState<TaxMode>(initial.taxMode);
  const [discount, setDiscount] = useState(initial.discount ? String(initial.discount) : "");
  const [issuedOn, setIssuedOn] = useState(initial.issuedOn);
  const [deadline, setDeadline] = useState(initial.deadline);
  const [notes, setNotes] = useState(initial.notes);
  const [rows, setRows] = useState<Row[]>(() => initial.items.map((item, index) => withKey(item, index)));
  const keys = useRef(initial.items.length);
  const keyed = (list: LineItem[]) => list.map((item) => withKey(item, keys.current++));

  const items: LineItem[] = rows.map(({ title: t, unit, quantity, unitPrice }) => ({ title: t, unit, quantity, unitPrice }));
  const discountValue = Number(discount.replaceAll(",", "")) || 0;
  const totals = computeTotals(items, { discount: discountValue, taxMode });
  const client = clients.find((c) => c.id === clientId);
  const visibleProjects = clientId ? projects.filter((p) => p.clientId === clientId || p.id === projectId) : projects;

  const update = (key: number, patch: Partial<LineItem>) => setRows((list) => list.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  const move = (index: number, direction: -1 | 1) =>
    setRows((list) => {
      const next = [...list];
      const target = index + direction;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  const addRow = (unit: LineUnit) => {
    const [row] = keyed([{ title: "", unit, quantity: unit === "hour" ? 8 : 1, unitPrice: unit === "hour" ? hourlyRate : 0 }]);
    setRows((list) => [...list, row]);
  };

  const deadlineName = kind === "estimate" ? "validUntil" : "dueOn";
  const docLabel = kind === "estimate" ? "견적서" : "인보이스";

  return (
    <div className={styles.editor}>
      <form action={formAction} className={styles.form} noValidate>
        {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
        <input type="hidden" name="items" value={JSON.stringify(items)} />

        <fieldset className={styles.group}>
          <legend className={styles.legend}>누구에게, 무엇을</legend>
          <div className={ui.formGrid}>
            <Field id={`${uid}-client`} label="고객" errors={errors?.clientId}>
              {(a11y) => (
                <select
                  {...a11y}
                  name="clientId"
                  className={ui.select}
                  value={clientId}
                  onChange={(event) => {
                    setClientId(event.target.value);
                    const project = projects.find((p) => p.id === projectId);
                    if (project && project.clientId !== event.target.value) setProjectId("");
                  }}
                >
                  <option value="">고객 선택</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company ? `${c.company} · ${c.name}` : c.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field id={`${uid}-project`} label="프로젝트 (선택)" errors={errors?.projectId}>
              {(a11y) => (
                <select
                  {...a11y}
                  name="projectId"
                  className={ui.select}
                  value={projectId}
                  onChange={(event) => {
                    setProjectId(event.target.value);
                    const project = projects.find((p) => p.id === event.target.value);
                    if (project?.clientId && !clientId) setClientId(project.clientId);
                    if (project && !title) setTitle(project.title);
                  }}
                >
                  <option value="">연결 안 함</option>
                  {visibleProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field id={`${uid}-title`} label="건명" errors={errors?.title} className={ui.span2}>
              {(a11y) => (
                <input {...a11y} name="title" className={ui.input} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} placeholder="예: 모먼트커피 정기구독 주문 페이지" required />
              )}
            </Field>
            <Field id={`${uid}-issued`} label="발행일" errors={errors?.issuedOn}>
              {(a11y) => <input {...a11y} type="date" name="issuedOn" className={ui.input} value={issuedOn} onChange={(event) => setIssuedOn(event.target.value)} required />}
            </Field>
            <Field id={`${uid}-deadline`} label={kind === "estimate" ? "유효기간" : "입금 기한"} errors={errors?.[deadlineName]}>
              {(a11y) => <input {...a11y} type="date" name={deadlineName} className={ui.input} value={deadline} min={issuedOn} onChange={(event) => setDeadline(event.target.value)} required />}
            </Field>
          </div>
        </fieldset>

        {kind === "estimate" ? <DraftPanel hourlyRate={hourlyRate} onDraft={(draft) => setRows(keyed(draft))} currentItems={items} /> : null}

        <fieldset className={styles.group} aria-describedby={errors?.items ? `${uid}-items-error` : undefined}>
          <legend className={styles.legend}>항목</legend>
          <p className={ui.hint}>기능 단위로 나눠 시간 × 시급으로 적거나, 서버비·디자인처럼 정액(식)으로 적어요.</p>
          <ol role="list" className={styles.lines}>
            {rows.map((row, index) => (
              <li key={row.key} className={styles.line}>
                <span className={`${ui.measure} ${styles.lineNo}`} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <label className={styles.lineTitle}>
                  <span className={styles.srOnly}>{index + 1}번 항목 이름</span>
                  <input className={ui.input} value={row.title} onChange={(event) => update(row.key, { title: event.target.value })} placeholder="예: 결제 연동" maxLength={120} />
                </label>
                <label className={styles.lineUnit}>
                  <span className={styles.srOnly}>{index + 1}번 단위</span>
                  <select
                    className={ui.select}
                    value={row.unit}
                    onChange={(event) => {
                      const unit = event.target.value as LineUnit;
                      update(row.key, unit === "hour" ? { unit, unitPrice: row.unitPrice || hourlyRate } : { unit, quantity: 1 });
                    }}
                  >
                    <option value="hour">시간</option>
                    <option value="lump">정액</option>
                  </select>
                </label>
                <label className={styles.lineQty}>
                  <span className={styles.srOnly}>{index + 1}번 {row.unit === "hour" ? "시간" : "수량"}</span>
                  <input
                    className={`${ui.input} ${ui.numberInput}`}
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={row.quantity}
                    onChange={(event) => update(row.key, { quantity: Number(event.target.value) })}
                  />
                  <span className={styles.unitSuffix} aria-hidden="true">
                    {row.unit === "hour" ? "h" : "식"}
                  </span>
                </label>
                <label className={styles.linePrice}>
                  <span className={styles.srOnly}>{index + 1}번 {row.unit === "hour" ? "시급" : "금액"} (원)</span>
                  <input
                    className={`${ui.input} ${ui.numberInput}`}
                    inputMode="numeric"
                    value={row.unitPrice ? row.unitPrice.toLocaleString("ko-KR") : ""}
                    onChange={(event) => update(row.key, { unitPrice: Number(event.target.value.replace(/[^\d]/g, "")) || 0 })}
                    placeholder={row.unit === "hour" ? "시급" : "금액"}
                  />
                </label>
                <span className={styles.lineAmount}>{formatWon(lineAmount(row))}</span>
                <span className={styles.lineTools}>
                  <button type="button" className={buttonClass("ghost", { small: true, iconOnly: true })} onClick={() => move(index, -1)} disabled={index === 0} aria-label={`${index + 1}번 항목 위로`}>
                    <ArrowUp size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={buttonClass("ghost", { small: true, iconOnly: true })}
                    onClick={() => move(index, 1)}
                    disabled={index === rows.length - 1}
                    aria-label={`${index + 1}번 항목 아래로`}
                  >
                    <ArrowDown size={14} aria-hidden="true" />
                  </button>
                  <button type="button" className={buttonClass("ghost", { small: true, iconOnly: true })} onClick={() => setRows((list) => list.filter((r) => r.key !== row.key))} aria-label={`${index + 1}번 항목 삭제`}>
                    <X size={14} aria-hidden="true" />
                  </button>
                </span>
              </li>
            ))}
          </ol>
          <div className={styles.addLines}>
            <button type="button" className={buttonClass("secondary", { small: true })} onClick={() => addRow("hour")}>
              <Plus size={14} aria-hidden="true" />
              시간 항목
            </button>
            <button type="button" className={buttonClass("secondary", { small: true })} onClick={() => addRow("lump")}>
              <Plus size={14} aria-hidden="true" />
              정액 항목
            </button>
            <span className={ui.hint}>
              시간 항목 합계 <span className={ui.measure}>{totals.hours}h</span>
            </span>
          </div>
          {errors?.items ? (
            <p id={`${uid}-items-error`} className={ui.fieldError}>
              {errors.items[0]}
            </p>
          ) : null}
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>세금과 할인</legend>
          <div className={styles.taxModes} role="radiogroup" aria-label="세금 처리">
            {(["withholding", "vat", "none"] as TaxMode[]).map((mode) => (
              <label key={mode} className={styles.taxMode} data-checked={taxMode === mode ? "" : undefined}>
                <input type="radio" name="taxMode" value={mode} checked={taxMode === mode} onChange={() => setTaxMode(mode)} />
                <span className={styles.taxTitle}>{TAX_MODE_LABEL[mode]}</span>
                <span className={styles.taxHint}>{TAX_MODE_HINT[mode]}</span>
              </label>
            ))}
          </div>
          <div className={ui.formGrid}>
            <Field id={`${uid}-discount`} label="할인 (원)" errors={errors?.discount}>
              {(a11y) => (
                <input
                  {...a11y}
                  name="discount"
                  className={`${ui.input} ${ui.numberInput}`}
                  inputMode="numeric"
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value.replace(/[^\d]/g, ""))}
                  placeholder="0"
                />
              )}
            </Field>
            <Field id={`${uid}-notes`} label="비고" errors={errors?.notes} className={ui.span2}>
              {(a11y) => (
                <textarea {...a11y} name="notes" className={ui.textarea} rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} placeholder="예: 착수금 30%, 잔금은 인수인계 후 청구" />
              )}
            </Field>
          </div>
        </fieldset>

        <div className={styles.submitBar}>
          <dl className={styles.submitTotals}>
            <div>
              <dt>청구 합계</dt>
              <dd>{formatWon(totals.billed)}</dd>
            </div>
            {taxMode === "withholding" ? (
              <div>
                <dt>실입금</dt>
                <dd>{formatWon(totals.payout)}</dd>
              </div>
            ) : null}
          </dl>
          <SubmitButton>{initial.id ? `${docLabel} 저장` : `${docLabel} 만들기`}</SubmitButton>
          <FormMessage state={state} />
        </div>
      </form>

      <div className={styles.preview}>
        <p className={styles.previewLabel}>고객이 받는 문서</p>
        <PaperSheet
          supplier={supplier}
          doc={{
            kind,
            number: initial.number ?? null,
            title,
            issuedOn: issuedOn || initial.issuedOn,
            deadline: deadline || initial.deadline,
            clientName: client?.name ?? null,
            clientCompany: client?.company ?? null,
            lines: items,
            taxMode,
            totals,
            notes,
          }}
        />
      </div>
    </div>
  );
}

function DraftPanel({ hourlyRate, onDraft, currentItems }: { hourlyRate: number; onDraft: (items: LineItem[]) => void; currentItems: LineItem[] }) {
  const uid = useId();
  const [brief, setBrief] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<EstimateDraftResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previous, setPrevious] = useState<LineItem[] | null>(null);

  const run = () =>
    startTransition(async () => {
      const outcome = await draftEstimate({ brief, hourlyRate });
      if (outcome.status === "error") {
        setError(outcome.message);
        return;
      }
      if (outcome.status !== "success" || !outcome.data) return;
      setError(null);
      setResult(outcome.data);
      setPrevious(currentItems);
      onDraft(outcome.data.items);
    });

  return (
    <details className={styles.draft}>
      <summary className={styles.draftSummary}>
        <Sparkles size={15} aria-hidden="true" />
        요청서로 항목 초안 만들기
      </summary>
      <div className={styles.draftBody}>
        <Field id={`${uid}-brief`} label="고객이 보낸 요청 내용" hint="메일이나 메신저 내용을 그대로 붙여 넣으세요. 기능별 시간 항목으로 나눠 드려요." errors={error ? [error] : undefined}>
          {(a11y) => (
            <textarea
              {...a11y}
              className={ui.textarea}
              rows={4}
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              maxLength={4000}
              placeholder="예: 원두 정기구독 주문 페이지가 필요해요. 2주/4주 주기 선택, 카드 정기결제, 관리자에서 주문 확인…"
            />
          )}
        </Field>
        <div className={ui.formActions}>
          <button type="button" className={buttonClass("secondary", { small: true })} onClick={run} disabled={pending || brief.trim().length < 10}>
            <Sparkles size={14} aria-hidden="true" />
            {pending ? "나누는 중…" : "초안 만들기"}
          </button>
          {previous ? (
            <button
              type="button"
              className={buttonClass("ghost", { small: true })}
              onClick={() => {
                onDraft(previous);
                setPrevious(null);
                setResult(null);
              }}
            >
              <Undo2 size={14} aria-hidden="true" />
              이전 항목으로
            </button>
          ) : null}
        </div>
        {result ? (
          <p className={styles.draftResult} role="status">
            <span className={ui.tag} data-tone={result.source === "claude" ? "accent" : undefined}>
              {result.source === "claude" ? "Claude가 나눔" : "기본 템플릿"}
            </span>
            {result.summary}
            {result.notice ? <span className={ui.muted}> {result.notice}</span> : null}
          </p>
        ) : null}
      </div>
    </details>
  );
}

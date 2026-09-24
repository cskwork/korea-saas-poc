"use client";

import { useState } from "react";
import { formatKrw, formatNumber } from "@/core/format";
import { addDays } from "../../domain/calendar";
import { ORDER_TYPES, ORDER_TYPE_INFO, PLAN_LABEL, type OrderType, type PlanKind } from "../../domain/catalog";
import { quotePrice, RUSH_SURCHARGE } from "../../domain/pricing";
import { TOOL_NAMES, toolsForType } from "../../domain/tools";
import type { OrderRecord } from "../../server/order-data";
import type { PackageRecord } from "../../server/studio-data";
import { createOrderAction, updateOrderAction } from "../../server/actions";
import { Frame } from "../frame/Frame";
import { Field } from "../ui/Field";
import { FormStatus } from "../ui/FormStatus";
import { controlProps, useFormAction } from "../ui/useFormAction";
import ui from "../ui.module.css";
import styles from "./order-form.module.css";

interface OrderFormProps {
  packages: PackageRecord[];
  today: string;
  /** Editing an existing order. */
  order?: OrderRecord;
  /** Prefill from the price sheet or portfolio ("이 패키지로 주문", "이런 작업 의뢰하기"). */
  initialPackageId?: string;
  initialType?: OrderType;
}

const CUSTOM = "";

export function OrderForm({ packages, today, order, initialPackageId, initialType }: OrderFormProps) {
  const editing = order !== undefined;
  const { state, pending, onSubmit, fieldError } = useFormAction(editing ? updateOrderAction : createOrderAction);

  const startPackage = packages.find((p) => p.id === (order ? order.packageId : initialPackageId));
  const [packageId, setPackageId] = useState<string>(startPackage?.id ?? CUSTOM);
  const pkg = packages.find((p) => p.id === packageId);
  const [type, setType] = useState<OrderType>(order?.type ?? pkg?.orderType ?? initialType ?? "thumbnail");
  const [title, setTitle] = useState(order?.title ?? "");
  const [quantity, setQuantity] = useState(String(order?.quantity ?? 1));
  const [rush, setRush] = useState(order?.rush ?? false);
  const [price, setPrice] = useState<string | null>(order ? String(order.price) : null);
  const [dueDate, setDueDate] = useState<string | null>(order?.dueDate ?? null);
  const [revisionLimit, setRevisionLimit] = useState<string | null>(
    order ? (order.revisionLimit === null ? "" : String(order.revisionLimit)) : null,
  );
  const [tools, setTools] = useState<string[] | null>(order?.tools ?? null);

  const plan: PlanKind = pkg?.kind ?? "single";
  const fixedType = pkg?.kind === "single" && pkg.orderType ? pkg.orderType : null;
  const effectiveType = fixedType ?? type;
  const qty = plan === "subscription" ? 1 : Math.max(Number(quantity) || 1, 1);
  const quote = pkg ? quotePrice({ unitPrice: pkg.price, quantity: qty, rush: plan === "single" && rush }) : null;
  // Untouched fields follow the chosen package; once edited they stay as typed.
  const priceValue = price ?? (quote !== null ? String(quote) : "");
  const dueValue = dueDate ?? addDays(today, pkg?.turnaroundDays ?? 3);
  const limitValue = revisionLimit ?? (pkg ? (pkg.revisionLimit === null ? "" : String(pkg.revisionLimit)) : "2");
  const toolValue = tools ?? toolsForType(effectiveType).map((t) => t.name);

  const choosePackage = (id: string) => {
    setPackageId(id);
    const next = packages.find((p) => p.id === id);
    if (next?.kind === "single" && next.orderType) setType(next.orderType);
    if (!editing) {
      setPrice(null);
      setDueDate(null);
      setRevisionLimit(null);
    }
  };

  const toggleTool = (name: string) =>
    setTools(toolValue.includes(name) ? toolValue.filter((t) => t !== name) : [...toolValue, name]);

  const singles = packages.filter((p) => p.kind === "single");
  const subscriptions = packages.filter((p) => p.kind === "subscription");
  const err = fieldError;

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {order && <input type="hidden" name="id" value={order.id} />}
      <input type="hidden" name="packageId" value={packageId} />
      {fixedType && <input type="hidden" name="type" value={fixedType} />}

      <div className={styles.columns}>
        <div className={styles.fields}>
          <fieldset className={styles.group}>
            <legend className={styles.legend}>패키지</legend>
            <p className={ui.hint}>
              고르면 금액, 포함 수정 횟수, 마감일이 채워져요. 금액과 날짜는 직접 바꿀 수 있어요.
            </p>
            {[
              { kind: "single" as const, items: singles },
              { kind: "subscription" as const, items: subscriptions },
            ].map(({ kind, items }) => (
              <div key={kind} className={styles.packageGroup} role="radiogroup" aria-label={PLAN_LABEL[kind]}>
                <p className={styles.packageKind}>{PLAN_LABEL[kind]}</p>
                <div className={styles.packages}>
                  {items.map((p) => (
                    <label key={p.id} className={styles.package} data-checked={packageId === p.id}>
                      <input
                        type="radio"
                        name="packageChoice"
                        value={p.id}
                        checked={packageId === p.id}
                        onChange={() => choosePackage(p.id)}
                      />
                      <span className={styles.packageName}>{p.name}</span>
                      <span className={styles.packagePrice}>
                        {formatKrw(p.price)}
                        <span className={styles.packageUnit}>/{p.unit}</span>
                      </span>
                      <span className={styles.packageTerms}>
                        {p.revisionLimit === null ? "수정 무제한" : `수정 ${p.revisionLimit}회`} · {p.turnaroundDays}일
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <label className={styles.package} data-checked={packageId === CUSTOM} data-wide>
              <input
                type="radio"
                name="packageChoice"
                value={CUSTOM}
                checked={packageId === CUSTOM}
                onChange={() => choosePackage(CUSTOM)}
              />
              <span className={styles.packageName}>직접 견적</span>
              <span className={styles.packageTerms}>가격표에 없는 작업은 금액과 조건을 직접 적어요.</span>
            </label>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>작업</legend>
            <div className={styles.row2}>
              <Field
                id="order-type"
                label="작업 종류"
                error={err("type")}
                hint={fixedType ? "선택한 패키지로 정해졌어요." : undefined}
              >
                <select
                  {...controlProps("order-type", err("type"), Boolean(fixedType))}
                  className={ui.input}
                  name={fixedType ? undefined : "type"}
                  value={effectiveType}
                  disabled={Boolean(fixedType)}
                  onChange={(e) => setType(e.target.value as OrderType)}
                >
                  {ORDER_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {ORDER_TYPE_INFO[t].label} ({ORDER_TYPE_INFO[t].frame.aspect})
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="order-title" label="작업명" error={err("title")}>
                <input
                  {...controlProps("order-title", err("title"))}
                  className={ui.input}
                  name="title"
                  required
                  minLength={2}
                  maxLength={60}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 가을 신메뉴 릴스 3편"
                />
              </Field>
            </div>
            <Field
              id="order-brief"
              label="요청 사항"
              optional
              error={err("brief")}
              hint="분위기, 타깃, 꼭 들어가야 할 문구나 정보를 적어 주세요. AI 콘티가 이 내용을 바탕으로 만들어져요."
            >
              <textarea
                {...controlProps("order-brief", err("brief"), true)}
                className={ui.input}
                name="brief"
                rows={4}
                maxLength={2000}
                defaultValue={order?.brief}
              />
            </Field>
            <Field
              id="order-refs"
              label="레퍼런스"
              optional
              error={err("referenceLinks")}
              hint="링크나 메모를 한 줄에 하나씩, 최대 10줄."
            >
              <textarea
                {...controlProps("order-refs", err("referenceLinks"), true)}
                className={ui.input}
                name="referenceLinks"
                rows={3}
                defaultValue={order?.referenceLinks.join("\n")}
                placeholder="https://…"
              />
            </Field>
            <fieldset className={styles.tools}>
              <legend className={ui.label}>
                사용할 AI 도구<span className={ui.optional}>선택</span>
              </legend>
              <div className={styles.toolList}>
                {TOOL_NAMES.map((name) => (
                  <label key={name} className={styles.tool} data-checked={toolValue.includes(name)}>
                    <input
                      type="checkbox"
                      name="tools"
                      value={name}
                      checked={toolValue.includes(name)}
                      onChange={() => toggleTool(name)}
                    />
                    {name}
                  </label>
                ))}
              </div>
            </fieldset>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>고객</legend>
            <div className={styles.row2}>
              <Field id="order-client" label="고객 이름" error={err("clientName")}>
                <input
                  {...controlProps("order-client", err("clientName"))}
                  className={ui.input}
                  name="clientName"
                  required
                  maxLength={40}
                  defaultValue={order?.clientName}
                  autoComplete="organization"
                  placeholder="가게·채널·회사 이름"
                />
              </Field>
              <Field id="order-contact" label="연락처" optional error={err("clientContact")}>
                <input
                  {...controlProps("order-contact", err("clientContact"))}
                  className={ui.input}
                  name="clientContact"
                  maxLength={80}
                  defaultValue={order?.clientContact}
                  placeholder="이메일, 전화, 카카오톡 채널"
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>일정·금액</legend>
            <div className={styles.row3}>
              <Field id="order-due" label="마감일" error={err("dueDate")}>
                <input
                  {...controlProps("order-due", err("dueDate"))}
                  className={ui.input}
                  type="date"
                  name="dueDate"
                  required
                  value={dueValue}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </Field>
              <Field
                id="order-qty"
                label="수량"
                error={err("quantity")}
                hint={plan === "subscription" ? "구독은 한 달 단위예요." : pkg ? `${pkg.unit} 단위` : undefined}
              >
                <input
                  {...controlProps("order-qty", err("quantity"), plan === "subscription" || Boolean(pkg))}
                  className={ui.input}
                  type="number"
                  name="quantity"
                  inputMode="numeric"
                  min={1}
                  max={100}
                  required
                  value={plan === "subscription" ? "1" : quantity}
                  readOnly={plan === "subscription"}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Field>
              <Field
                id="order-limit"
                label="포함 수정 횟수"
                error={err("revisionLimit")}
                hint="비워 두면 무제한이에요."
              >
                <input
                  {...controlProps("order-limit", err("revisionLimit"), true)}
                  className={ui.input}
                  type="number"
                  name="revisionLimit"
                  inputMode="numeric"
                  min={0}
                  max={20}
                  value={limitValue}
                  onChange={(e) => setRevisionLimit(e.target.value)}
                  placeholder="무제한"
                />
              </Field>
            </div>
            {plan === "single" && (
              <label className={ui.check}>
                <input type="checkbox" name="rush" checked={rush} onChange={(e) => setRush(e.target.checked)} />
                <span>
                  긴급 작업 (24시간 안에 납품)
                  <span className={ui.hint}> · 금액에 {formatNumber(RUSH_SURCHARGE * 100)}%가 더해져요</span>
                </span>
              </label>
            )}
            <Field
              id="order-price"
              label="금액 (원)"
              error={err("price")}
              hint={
                quote !== null
                  ? price !== null && Number(price) !== quote
                    ? `직접 입력한 금액이에요. 패키지 기준으로는 ${formatKrw(quote)}이에요.`
                    : "패키지 가격 × 수량으로 자동 계산했어요."
                  : "직접 견적 금액을 적어 주세요."
              }
            >
              <div className={styles.priceRow}>
                <input
                  {...controlProps("order-price", err("price"), true)}
                  className={ui.input}
                  type="number"
                  name="price"
                  inputMode="numeric"
                  min={0}
                  step={1000}
                  required
                  value={priceValue}
                  onChange={(e) => setPrice(e.target.value)}
                />
                {quote !== null && price !== null && Number(price) !== quote && (
                  <button type="button" className={ui.quiet} onClick={() => setPrice(null)}>
                    패키지 금액으로
                  </button>
                )}
              </div>
            </Field>
          </fieldset>
        </div>

        <aside className={styles.preview} aria-label="접수 미리보기">
          <div className={styles.previewSheet}>
            <p className={styles.previewLabel}>
              {ORDER_TYPE_INFO[effectiveType].label} · {ORDER_TYPE_INFO[effectiveType].frame.aspect} ·{" "}
              {ORDER_TYPE_INFO[effectiveType].frame.size}
            </p>
            <div className={styles.previewFrame}>
              <Frame
                type={effectiveType}
                medium="sketch"
                height={
                  ORDER_TYPE_INFO[effectiveType].frame.ratio[1] > ORDER_TYPE_INFO[effectiveType].frame.ratio[0]
                    ? 220
                    : 150
                }
                maxWidth={280}
                headline={title.trim() || undefined}
              />
            </div>
            <dl className={styles.summary}>
              <div>
                <dt>패키지</dt>
                <dd>{pkg ? `${pkg.name} (${PLAN_LABEL[pkg.kind]})` : "직접 견적"}</dd>
              </div>
              <div>
                <dt>마감</dt>
                <dd>{dueValue}</dd>
              </div>
              <div>
                <dt>수정</dt>
                <dd>{limitValue === "" ? "무제한" : `${limitValue}회 포함`}</dd>
              </div>
              <div className={styles.total}>
                <dt>금액</dt>
                <dd>{priceValue ? formatKrw(Number(priceValue)) : "—"}</dd>
              </div>
            </dl>
            <FormStatus state={state} className={styles.status} />
            <button
              type="submit"
              className={[ui.button, styles.submit].join(" ")}
              disabled={pending}
              aria-busy={pending}
            >
              {pending && <span className={ui.spinner} aria-hidden="true" />}
              {editing ? "변경 내용 저장" : "주문 접수하기"}
            </button>
          </div>
        </aside>
      </div>
    </form>
  );
}

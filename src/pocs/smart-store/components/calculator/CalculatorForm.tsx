"use client";

import { useActionState, useMemo, useState } from "react";
import clsx from "clsx";
import { LoaderCircle, Save } from "lucide-react";
import { idleState, type ActionState } from "@/core/actions";
import { formatNumber } from "@/core/format";
import {
  CATEGORIES,
  CATEGORY_INFO,
  feeRateBp,
  formatFeeRate,
  isCategory,
  type Category,
} from "../../domain/categories";
import { breakEvenPrice, computeMargin, priceForTargetMargin, projectMonthly } from "../../domain/margin";
import { saveCalculationAction } from "../../server/actions";
import { parseWon } from "../listings/usePriceDraft";
import { InputField, SelectField } from "../ui/Field";
import { HangTag, MarginChip } from "../ui/HangTag";
import { MarginReceipt } from "../ui/MarginReceipt";
import { Notice } from "../ui/Notice";
import { Slip } from "../ui/Slip";
import { useToast } from "../ui/Toast";
import ui from "../ui/ui.module.css";
import { CostBar } from "./CostBar";
import styles from "./calculator.module.css";

export interface CalculatorInitial {
  label: string;
  category: Category;
  cost: number;
  price: number;
  shipping: number;
  quantity: number;
}

/** Live margin calculator: the tag and receipt rewrite as you type; 저장 keeps the inputs in history. */
export function CalculatorForm({ initial }: { initial: CalculatorInitial }) {
  const toast = useToast();
  const [state, submit, pending] = useActionState(async (previous: ActionState, formData: FormData) => {
    const result = await saveCalculationAction(previous, formData);
    if (result.status === "success" && result.message) toast(result.message);
    return result;
  }, idleState);
  const [label, setLabel] = useState(initial.label);
  const [category, setCategory] = useState<Category>(initial.category);
  const [values, setValues] = useState({
    cost: String(initial.cost),
    price: String(initial.price),
    shipping: String(initial.shipping),
    quantity: String(initial.quantity),
  });
  const [target, setTarget] = useState("30");
  const [touched, setTouched] = useState(false);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  const cost = parseWon(values.cost);
  const shipping = parseWon(values.shipping);
  const quantity = Math.max(parseWon(values.quantity), 0);
  const fee = feeRateBp(category);
  const margin = useMemo(
    () => computeMargin({ price: parseWon(values.price), cost, shipping, feeRateBp: fee }),
    [values.price, cost, shipping, fee],
  );
  const monthly = projectMonthly(margin, quantity);
  const targetRate = Math.min(Math.max(parseWon(target), 0), 90) / 100;
  const targetPrice = priceForTargetMargin(cost, shipping, fee, targetRate);
  const breakEven = cost + shipping > 0 ? breakEvenPrice(cost, shipping, fee) : 0;

  const set = (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setTouched(true);
    setValues((current) => ({ ...current, [key]: event.target.value }));
  };

  return (
    <form action={submit} className={styles.layout} noValidate>
      <Slip title="비용 입력" titleId="calc-inputs">
        <div className={styles.fields}>
          <SelectField
            id="calc-category"
            name="category"
            label="카테고리 (네이버 수수료)"
            value={category}
            onChange={(event) => {
              if (!isCategory(event.target.value)) return;
              setTouched(true);
              setCategory(event.target.value);
            }}
            errors={errors.category}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_INFO[c].feeLabel} · {formatFeeRate(CATEGORY_INFO[c].feeRateBp)}
              </option>
            ))}
          </SelectField>
          <div className={styles.pair}>
            <InputField
              id="calc-cost"
              name="cost"
              label="매입가 (원)"
              type="number"
              min={0}
              step={10}
              numeric
              value={values.cost}
              onChange={set("cost")}
              errors={errors.cost}
            />
            <InputField
              id="calc-price"
              name="price"
              label="판매가 (원)"
              type="number"
              min={0}
              step={10}
              numeric
              value={values.price}
              onChange={set("price")}
              errors={errors.price}
            />
          </div>
          <p className={styles.liveSummary} aria-hidden>
            남는 돈 <MarginChip margin={margin} />
          </p>
          <div className={styles.pair}>
            <InputField
              id="calc-shipping"
              name="shippingCost"
              label="배송비 (원)"
              type="number"
              min={0}
              step={10}
              numeric
              value={values.shipping}
              onChange={set("shipping")}
              errors={errors.shippingCost}
              hint="도매처에 내는 건당 배송비"
            />
            <InputField
              id="calc-quantity"
              name="monthlyQuantity"
              label="예상 월 판매량 (개)"
              type="number"
              min={1}
              step={1}
              numeric
              value={values.quantity}
              onChange={set("quantity")}
              errors={errors.monthlyQuantity}
            />
          </div>
          <div className={styles.target}>
            <InputField
              id="calc-target"
              label="목표 마진율 (%)"
              type="number"
              min={0}
              max={90}
              step={5}
              numeric
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              className={styles.targetField}
            />
            <div className={styles.targetResult} aria-live="polite">
              {targetPrice ? (
                <>
                  <span>
                    판매가 <strong>{formatNumber(targetPrice)}원</strong> 이상이면 목표 달성
                  </span>
                  <button
                    type="button"
                    className={clsx(ui.btn, ui.btnSm)}
                    onClick={() => {
                      setTouched(true);
                      setValues((current) => ({ ...current, price: String(targetPrice) }));
                    }}
                  >
                    이 가격으로
                  </button>
                </>
              ) : (
                <span>수수료를 빼면 이 마진율은 만들 수 없어요.</span>
              )}
              {breakEven ? <span className={ui.muted}>손익분기 {formatNumber(breakEven)}원</span> : null}
            </div>
          </div>
          <InputField
            id="calc-label"
            name="label"
            label="메모 (기록에 표시)"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            maxLength={40}
            placeholder="예: 텀블러 가격 인상 검토"
            errors={errors.label}
          />
          {state.status === "error" ? <Notice tone="error">{state.message}</Notice> : null}
          <button type="submit" className={clsx(ui.btn, ui.btnPop)} disabled={pending} aria-busy={pending || undefined}>
            {pending ? (
              <LoaderCircle size={16} className={ui.spin} aria-hidden />
            ) : (
              <Save size={16} strokeWidth={2} aria-hidden />
            )}
            계산 기록에 남기기
          </button>
        </div>
      </Slip>

      <Slip title="개당 남는 돈" titleId="calc-result" className={styles.result}>
        <div className={styles.resultBody} aria-live="polite">
          <div className={styles.resultTag}>
            <HangTag margin={margin} size="lg" animate={touched} />
          </div>
          <div className={styles.resultText}>
            <MarginReceipt margin={margin} />
            {margin.price > 0 ? <CostBar margin={margin} /> : null}
          </div>
        </div>
        <dl className={styles.monthly}>
          <div className={styles.monthlyHead}>
            <dt>월 {formatNumber(quantity)}개 판매 기준</dt>
          </div>
          <div>
            <dt>월 매출</dt>
            <dd>{formatNumber(monthly.revenue)}원</dd>
          </div>
          <div>
            <dt>월 매입</dt>
            <dd>−{formatNumber(monthly.cost)}원</dd>
          </div>
          <div>
            <dt>월 수수료</dt>
            <dd>−{formatNumber(monthly.fee)}원</dd>
          </div>
          <div>
            <dt>월 배송비</dt>
            <dd>−{formatNumber(monthly.shipping)}원</dd>
          </div>
          <div className={clsx(styles.monthlyTotal, monthly.profit < 0 && styles.lossText)}>
            <dt>월 남는 돈</dt>
            <dd>
              {monthly.profit < 0 ? "−" : ""}
              {formatNumber(Math.abs(monthly.profit))}원
            </dd>
          </div>
        </dl>
      </Slip>
    </form>
  );
}

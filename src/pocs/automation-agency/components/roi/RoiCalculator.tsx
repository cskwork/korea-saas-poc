"use client";

import { useState, type CSSProperties } from "react";
import { Save } from "lucide-react";
import { formatKrw, formatNumber, formatPercent } from "@/core/format";
import { INDUSTRIES, INDUSTRY_LABEL } from "../../domain/labels";
import { computeRoi, ROI_LIMITS, roiJourney, type RoiInput } from "../../domain/roi";
import { createDiagnosisAction } from "../../server/actions";
import { Field } from "../ui/Field";
import { ActionNotice } from "../ui/Notice";
import { SubmitButton } from "../ui/SubmitButton";
import { useActionForm } from "../ui/useActionForm";
import ui from "../ui/ui.module.css";
import { JourneyChart } from "./JourneyChart";
import styles from "./roi.module.css";

export interface PackagePreset {
  id: string;
  name: string;
  setupFee: number;
  monthlyFee: number;
}

const INPUTS: { key: keyof RoiInput; label: string; unit: string; hint: string }[] = [
  {
    key: "weeklyHours",
    label: "주당 반복 업무 시간",
    unit: "시간",
    hint: "자동화 대상 업무에 한 주 동안 쓰는 시간 (모든 담당자 합계)",
  },
  { key: "hourlyCost", label: "시간당 인건비", unit: "원", hint: "급여·4대보험·복리후생을 포함한 시간당 비용" },
  { key: "automationRate", label: "자동화 비율", unit: "%", hint: "그 업무 중 자동화가 대신할 수 있는 몫" },
  { key: "investment", label: "구축비 (1회)", unit: "원", hint: "자동화 구축에 드는 일회성 비용" },
  { key: "monthlyFee", label: "월 유지보수비", unit: "원", hint: "운영·점검·수정을 위한 월 구독료" },
];

function clamp(key: keyof RoiInput, value: number) {
  const { min, max } = ROI_LIMITS[key];
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** Live ROI calculator; a result can be saved as a diagnosis (lead) for a client. */
export function RoiCalculator({
  initial,
  presets,
  initialClient,
}: {
  initial: RoiInput;
  presets: PackagePreset[];
  initialClient?: { clientName: string; contactName: string; industry: string; note: string };
}) {
  const [values, setValues] = useState<RoiInput>(initial);
  const [drafts, setDrafts] = useState<Partial<Record<keyof RoiInput, string>>>({});
  const [presetId, setPresetId] = useState("");
  const result = computeRoi(values);
  const journey = roiJourney(values, 24);
  const { state, pending, errors, formProps } = useActionForm(createDiagnosisAction);

  const set = (key: keyof RoiInput, value: number) => setValues((v) => ({ ...v, [key]: clamp(key, value) }));

  const applyPreset = (id: string) => {
    setPresetId(id);
    const preset = presets.find((p) => p.id === id);
    if (!preset) return;
    setValues((v) => ({
      ...v,
      investment: clamp("investment", preset.setupFee),
      monthlyFee: clamp("monthlyFee", preset.monthlyFee),
    }));
  };

  return (
    <div className={styles.layout}>
      <section className={styles.inputs} aria-labelledby="roi-inputs-title">
        <h2 id="roi-inputs-title" className={styles.panelTitle}>
          고객 업무 조건
        </h2>
        <div className={ui.field}>
          <label htmlFor="roi-preset" className={ui.label}>
            패키지 가격 불러오기 <span className={ui.optional}>(선택)</span>
          </label>
          <select id="roi-preset" className={ui.select} value={presetId} onChange={(e) => applyPreset(e.target.value)}>
            <option value="">직접 입력</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · 구축 {formatKrw(p.setupFee)} · 월 {formatKrw(p.monthlyFee)}
              </option>
            ))}
          </select>
        </div>
        {INPUTS.map(({ key, label, unit, hint }) => {
          const limits = ROI_LIMITS[key];
          const id = `roi-${key}`;
          return (
            <div key={key} className={styles.slider}>
              <div className={styles.sliderHead}>
                <label htmlFor={id} className={ui.label}>
                  {label}
                </label>
                <span className={styles.numberWrap}>
                  <input
                    type="number"
                    inputMode="numeric"
                    className={styles.number}
                    aria-label={`${label} (${unit})`}
                    min={limits.min}
                    max={limits.max}
                    step={limits.step}
                    value={drafts[key] ?? String(values[key])}
                    onChange={(e) => {
                      setDrafts((d) => ({ ...d, [key]: e.target.value }));
                      const n = Number(e.target.value);
                      if (e.target.value !== "" && Number.isFinite(n) && n >= limits.min && n <= limits.max)
                        set(key, n);
                    }}
                    onBlur={(e) => {
                      const n = Number(e.target.value);
                      if (Number.isFinite(n) && e.target.value !== "") set(key, n);
                      setDrafts((d) => ({ ...d, [key]: undefined }));
                    }}
                  />
                  <span className={styles.unit}>{unit}</span>
                </span>
              </div>
              <input
                id={id}
                type="range"
                className={styles.range}
                style={{ "--fill": `${((values[key] - limits.min) / (limits.max - limits.min)) * 100}%` } as CSSProperties}
                min={limits.min}
                max={limits.max}
                step={limits.step}
                value={values[key]}
                aria-describedby={`${id}-hint`}
                aria-valuetext={`${formatNumber(values[key])}${unit}`}
                onChange={(e) => set(key, Number(e.target.value))}
              />
              <p id={`${id}-hint`} className={ui.hint}>
                {hint}
              </p>
            </div>
          );
        })}
      </section>

      <section className={styles.results} aria-labelledby="roi-result-title" aria-live="polite">
        <h2 id="roi-result-title" className={styles.panelTitle}>
          예상 효과
        </h2>
        <p className={styles.headline}>
          매달 <strong>{formatNumber(result.monthlyHoursSaved, 0)}시간</strong>, 인건비로{" "}
          <strong>{formatKrw(result.monthlySavings)}</strong>만큼 아껴요.{" "}
          {result.monthlyNet > 0 ? (
            <>
              유지보수비를 내고도 월 <strong>{formatKrw(result.monthlyNet)}</strong>이 남고,{" "}
              {result.paybackMonths === 0 ? (
                <strong>첫 달부터 이익</strong>
              ) : (
                <>
                  <strong>{result.paybackMonths}개월</strong>이면 구축비를 회수해요
                </>
              )}
              .
            </>
          ) : (
            <span className={styles.warn}>
              유지보수비가 절감액보다 커서 구축비를 회수할 수 없어요. 범위나 요금을 조정해 보세요.
            </span>
          )}
        </p>
        <dl className={styles.fare}>
          <div>
            <dt>월 절감 시간</dt>
            <dd>{formatNumber(result.monthlyHoursSaved, 1)}시간</dd>
          </div>
          <div>
            <dt>연 절감 시간</dt>
            <dd>{formatNumber(result.yearlyHoursSaved, 0)}시간</dd>
          </div>
          <div>
            <dt>월 절감액</dt>
            <dd>{formatKrw(result.monthlySavings)}</dd>
          </div>
          <div>
            <dt>연 절감액</dt>
            <dd>{formatKrw(result.yearlySavings)}</dd>
          </div>
          <div>
            <dt>첫해 비용 (구축 + 12개월)</dt>
            <dd>{formatKrw(result.firstYearCost)}</dd>
          </div>
          <div>
            <dt>첫해 ROI</dt>
            <dd className={result.roi !== null && result.roi < 0 ? styles.negative : undefined}>
              {result.roi === null ? "—" : formatPercent(result.roi, 0)}
            </dd>
          </div>
        </dl>
        <h3 className={styles.chartTitle}>24개월 누적 순이익</h3>
        <JourneyChart points={journey} paybackMonths={result.paybackMonths} />
        <p className={ui.hint}>월 4.33주 기준. 절감액은 인건비 환산이며 실제 인력 감축을 뜻하지 않아요.</p>
      </section>

      <section className={styles.save} aria-labelledby="roi-save-title">
        <h2 id="roi-save-title" className={styles.panelTitle}>
          진단으로 저장
        </h2>
        <form className={ui.form} {...formProps} noValidate>
          {(Object.keys(values) as (keyof RoiInput)[]).map((key) => (
            <input key={key} type="hidden" name={key} value={values[key]} />
          ))}
          <div className={ui.fieldGrid}>
            <Field id="dx-client" label="고객명" errors={errors("clientName")}>
              {(p) => (
                <input
                  {...p}
                  name="clientName"
                  className={ui.input}
                  defaultValue={initialClient?.clientName}
                  maxLength={60}
                />
              )}
            </Field>
            <Field id="dx-contact" label="담당자" optional errors={errors("contactName")}>
              {(p) => (
                <input
                  {...p}
                  name="contactName"
                  className={ui.input}
                  defaultValue={initialClient?.contactName}
                  maxLength={30}
                />
              )}
            </Field>
            <Field id="dx-industry" label="업종" errors={errors("industry")}>
              {(p) => (
                <select
                  {...p}
                  name="industry"
                  className={ui.select}
                  defaultValue={initialClient?.industry ?? "service"}
                >
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>
                      {INDUSTRY_LABEL[i]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
          <Field id="dx-note" label="메모" optional errors={errors("note")}>
            {(p) => (
              <textarea {...p} name="note" className={ui.textarea} defaultValue={initialClient?.note} maxLength={500} />
            )}
          </Field>
          <div className={ui.formFoot}>
            <SubmitButton pending={pending} pendingLabel="저장 중…" icon={<Save size={16} aria-hidden="true" />}>
              진단 저장
            </SubmitButton>
            <ActionNotice state={state} />
          </div>
        </form>
      </section>
    </div>
  );
}

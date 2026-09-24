"use client";

import { useState } from "react";
import { ORDER_TYPES, ORDER_TYPE_INFO, type OrderType } from "../../domain/catalog";
import { TOOL_NAMES } from "../../domain/tools";
import { createPortfolioAction, updatePortfolioAction } from "../../server/actions";
import { Frame } from "../frame/Frame";
import { Field } from "../ui/Field";
import { FormStatus } from "../ui/FormStatus";
import { controlProps, useFormAction } from "../ui/useFormAction";
import ui from "../ui.module.css";
import styles from "./portfolio-form.module.css";

export interface PortfolioDraft {
  id?: string;
  orderId?: string;
  title: string;
  category: OrderType;
  clientLabel: string;
  headline: string;
  summary: string;
  tools: string[];
  palette: string[];
}

const DEFAULT_PALETTE = ["#1f2328", "#f4f5f6", "#d6453d"];

export function PortfolioForm({ draft }: { draft: PortfolioDraft }) {
  const editing = Boolean(draft.id);
  const { state, pending, onSubmit, fieldError } = useFormAction(
    editing ? updatePortfolioAction : createPortfolioAction,
  );
  const [category, setCategory] = useState<OrderType>(draft.category);
  const [headline, setHeadline] = useState(draft.headline);
  const [palette, setPalette] = useState<string[]>([0, 1, 2].map((i) => draft.palette[i] ?? DEFAULT_PALETTE[i]));
  const info = ORDER_TYPE_INFO[category];
  const tall = info.frame.ratio[1] > info.frame.ratio[0];
  const err = fieldError;

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {draft.id && <input type="hidden" name="id" value={draft.id} />}
      {draft.orderId && <input type="hidden" name="orderId" value={draft.orderId} />}
      <div className={styles.fields}>
        <div className={styles.row2}>
          <Field id="pf-title" label="작업 제목" error={err("title")}>
            <input
              {...controlProps("pf-title", err("title"))}
              className={ui.input}
              name="title"
              required
              maxLength={60}
              defaultValue={draft.title}
            />
          </Field>
          <Field id="pf-category" label="카테고리" error={err("category")}>
            <select
              {...controlProps("pf-category", err("category"))}
              className={ui.input}
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as OrderType)}
            >
              {ORDER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ORDER_TYPE_INFO[t].label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className={styles.row2}>
          <Field
            id="pf-client"
            label="고객 설명"
            error={err("clientLabel")}
            hint="실명 대신 ‘동네 카페’처럼 업종으로 적어도 좋아요."
          >
            <input
              {...controlProps("pf-client", err("clientLabel"), true)}
              className={ui.input}
              name="clientLabel"
              required
              maxLength={40}
              defaultValue={draft.clientLabel}
            />
          </Field>
          <Field
            id="pf-headline"
            label="대표 문구"
            error={err("headline")}
            hint="작업물에 실제로 들어간 제목이나 카피."
          >
            <input
              {...controlProps("pf-headline", err("headline"), true)}
              className={ui.input}
              name="headline"
              required
              maxLength={40}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </Field>
        </div>
        <Field id="pf-summary" label="작업 설명" optional error={err("summary")}>
          <textarea
            {...controlProps("pf-summary", err("summary"))}
            className={ui.input}
            name="summary"
            rows={4}
            maxLength={400}
            defaultValue={draft.summary}
          />
        </Field>
        <fieldset className={styles.fieldset}>
          <legend className={ui.label}>색상</legend>
          <div className={styles.colors}>
            {palette.map((color, i) => (
              <label key={i} className={styles.color}>
                <input
                  type="color"
                  name="palette"
                  value={color}
                  onChange={(e) => setPalette(palette.map((c, j) => (j === i ? e.target.value : c)))}
                  aria-label={["주 색상", "바탕 색상", "글자 색상"][i]}
                />
                <span>
                  {["주 색상", "바탕", "글자"][i]} <span className={styles.hex}>{color.toUpperCase()}</span>
                </span>
              </label>
            ))}
          </div>
          {err("palette") && <p className={ui.error}>{err("palette")}</p>}
        </fieldset>
        <fieldset className={styles.fieldset}>
          <legend className={ui.label}>
            사용한 도구<span className={ui.optional}>선택</span>
          </legend>
          <div className={styles.tools}>
            {TOOL_NAMES.map((name) => (
              <label key={name} className={ui.check}>
                <input type="checkbox" name="tools" value={name} defaultChecked={draft.tools.includes(name)} />
                {name}
              </label>
            ))}
          </div>
        </fieldset>
        <FormStatus state={state} />
        <div>
          <button type="submit" className={ui.button} disabled={pending} aria-busy={pending}>
            {pending && <span className={ui.spinner} aria-hidden="true" />}
            {editing ? "변경 내용 저장" : "포트폴리오에 올리기"}
          </button>
        </div>
      </div>
      <aside className={styles.preview} aria-label="미리보기">
        <p className={styles.previewLabel}>
          미리보기 · {info.frame.aspect} · {info.frame.size}
        </p>
        <div className={styles.previewFrame}>
          <Frame
            type={category}
            medium="ink"
            height={tall ? 300 : 170}
            maxWidth={300}
            palette={palette}
            headline={headline || "대표 문구"}
          />
        </div>
      </aside>
    </form>
  );
}

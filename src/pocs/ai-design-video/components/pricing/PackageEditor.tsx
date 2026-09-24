"use client";

import { useId, useState } from "react";
import { updatePackageAction } from "../../server/actions";
import type { PackageRecord } from "../../server/studio-data";
import { Field } from "../ui/Field";
import { FormStatus } from "../ui/FormStatus";
import { controlProps, useFormAction } from "../ui/useFormAction";
import ui from "../ui.module.css";
import styles from "./pricing.module.css";

/** The operator's inline edit of a package's price and terms. */
export function PackageEditor({ pkg }: { pkg: PackageRecord }) {
  const [open, setOpen] = useState(false);
  const { state, pending, onSubmit, fieldError } = useFormAction(updatePackageAction);
  const id = useId();
  const err = fieldError;
  return (
    <div className={styles.editor}>
      <button
        type="button"
        className={ui.quiet}
        aria-expanded={open}
        aria-controls={`${id}-form`}
        onClick={() => setOpen(!open)}
      >
        {open ? "닫기" : "가격·조건 수정"}
      </button>
      {open && (
        <form id={`${id}-form`} className={styles.editorForm} onSubmit={onSubmit}>
          <input type="hidden" name="id" value={pkg.id} />
          <Field id={`${id}-price`} label={`가격 (원/${pkg.unit})`} error={err("price")}>
            <input
              {...controlProps(`${id}-price`, err("price"))}
              className={ui.input}
              type="number"
              name="price"
              min={0}
              step={1000}
              inputMode="numeric"
              required
              defaultValue={pkg.price}
            />
          </Field>
          <Field id={`${id}-limit`} label="포함 수정" error={err("revisionLimit")} hint="비우면 무제한">
            <input
              {...controlProps(`${id}-limit`, err("revisionLimit"), true)}
              className={ui.input}
              type="number"
              name="revisionLimit"
              min={0}
              max={20}
              inputMode="numeric"
              defaultValue={pkg.revisionLimit ?? ""}
            />
          </Field>
          <Field id={`${id}-days`} label="작업 기간 (일)" error={err("turnaroundDays")}>
            <input
              {...controlProps(`${id}-days`, err("turnaroundDays"))}
              className={ui.input}
              type="number"
              name="turnaroundDays"
              min={1}
              max={60}
              inputMode="numeric"
              required
              defaultValue={pkg.turnaroundDays}
            />
          </Field>
          <label className={ui.check}>
            <input type="checkbox" name="featured" defaultChecked={pkg.featured} />
            추천 패키지로 표시
          </label>
          <FormStatus state={state} />
          <button type="submit" className={[ui.button, ui.small].join(" ")} disabled={pending} aria-busy={pending}>
            {pending && <span className={ui.spinner} aria-hidden="true" />}
            저장
          </button>
        </form>
      )}
    </div>
  );
}

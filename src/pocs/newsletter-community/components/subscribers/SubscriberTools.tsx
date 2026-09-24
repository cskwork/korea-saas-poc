"use client";

import { useState } from "react";
import { Download, Upload, UserPlus } from "lucide-react";
import { TIER_LABEL, TIERS } from "../../domain/tiers";
import { addSubscriber, importSubscribersCsv } from "../../server/actions";
import { buttonClass } from "../ui/button";
import { SelectField, TextField } from "../ui/fields";
import { FormMessage } from "../ui/FormMessage";
import { useFormSubmit } from "../ui/useFormSubmit";
import ui from "../ui/ui.module.css";
import styles from "./subscribers.module.css";

type Panel = "add" | "import" | null;

/** 명부에 올리기 and CSV 가져오기 open inline under the toolbar; 내보내기 downloads the current view. */
export function SubscriberTools({ exportHref }: { exportHref: string }) {
  const [panel, setPanel] = useState<Panel>(null);
  const toggle = (next: Panel) => setPanel((current) => (current === next ? null : next));
  return (
    <div className={styles.tools}>
      <div className={styles.toolButtons}>
        <button
          type="button"
          className={buttonClass(panel === "add" ? "primary" : "secondary")}
          aria-expanded={panel === "add"}
          aria-controls="subscriber-add"
          onClick={() => toggle("add")}
        >
          <UserPlus size={16} aria-hidden />
          명부에 올리기
        </button>
        <button
          type="button"
          className={buttonClass(panel === "import" ? "primary" : "secondary")}
          aria-expanded={panel === "import"}
          aria-controls="subscriber-import"
          onClick={() => toggle("import")}
        >
          <Upload size={16} aria-hidden />
          CSV 가져오기
        </button>
        <a href={exportHref} className={buttonClass("secondary")} download>
          <Download size={16} aria-hidden />
          CSV 내보내기
        </a>
      </div>
      {panel === "add" && <AddSubscriberForm />}
      {panel === "import" && <CsvImportForm />}
    </div>
  );
}

function AddSubscriberForm() {
  const { state, pending, formRef, onSubmit, action, fieldError } = useFormSubmit(addSubscriber, {
    resetOnSuccess: true,
    toast: true,
  });
  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} className={styles.panel} id="subscriber-add" aria-label="명부에 올리기">
      <div className={styles.panelFields}>
        <TextField label="이름" name="name" required maxLength={40} autoComplete="off" error={fieldError("name")} autoFocus />
        <TextField label="이메일" name="email" type="email" required maxLength={120} autoComplete="off" error={fieldError("email")} />
        <SelectField label="등급" name="tier" defaultValue="free" error={fieldError("tier")}>
          {TIERS.map((tier) => (
            <option key={tier} value={tier}>
              {TIER_LABEL[tier]}
            </option>
          ))}
        </SelectField>
        <button type="submit" className={buttonClass("primary", "md", styles.panelSubmit)} disabled={pending}>
          {pending ? "올리는 중…" : "올리기"}
        </button>
      </div>
      <p className={ui.hint}>유료 등급으로 올리면 오늘부터 유료 구독으로 계산돼요. 결제는 연동되어 있지 않아요.</p>
      <FormMessage state={state} showSuccess={false} />
    </form>
  );
}

function CsvImportForm() {
  const { state, pending, formRef, onSubmit, action, fieldError } = useFormSubmit(importSubscribersCsv, {
    resetOnSuccess: true,
  });
  const errors = state.status === "success" ? (state.data?.errors ?? []) : [];
  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={onSubmit}
      className={styles.panel}
      id="subscriber-import"
      aria-label="CSV 가져오기"
    >
      <div className={styles.panelFields}>
        <TextField
          label="CSV 파일"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          error={fieldError("file")}
          hint="첫 줄은 열 제목이에요: 이름, 이메일, 등급(무료·베이직·프로), 상태(구독 중·해지), 가입일(2026-09-01). 등급·상태·가입일은 빼도 돼요."
          className={styles.fileField}
        />
        <button type="submit" className={buttonClass("primary", "md", styles.panelSubmit)} disabled={pending}>
          {pending ? "읽는 중…" : "가져오기"}
        </button>
      </div>
      <p className={ui.hint}>이미 명부에 있는 이메일은 덮어쓰지 않고 건너뛰어요. 한 번에 2,000명, 1MB까지.</p>
      <FormMessage state={state} />
      {errors.length > 0 && (
        <ul className={styles.importErrors} role="list" aria-label="읽지 못한 줄">
          {errors.map((error) => (
            <li key={error.line}>
              <strong>{error.line}번째 줄</strong> {error.message}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

"use client";

import type { School } from "../../db/schema";
import { updateSchoolAction } from "../../server/actions";
import { FieldMessage, fieldAttrs, FormNotice, SubmitButton, useFormAction } from "../ui/form";
import ui from "../ui/ui.module.css";

export function SchoolForm({ school }: { school: Pick<School, "name" | "creatorName"> }) {
  const { state, pending, formProps } = useFormAction(updateSchoolAction);
  return (
    <form {...formProps} className={ui.form} noValidate>
      <div className={ui.formRow}>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="school-name">
            스쿨 이름
          </label>
          <input className={ui.input} {...fieldAttrs(state, "name", "school-name")} defaultValue={school.name} maxLength={40} />
          <FieldMessage state={state} name="name" id="school-name" />
        </div>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="school-creator">
            강사 이름
          </label>
          <input className={ui.input} {...fieldAttrs(state, "creatorName", "school-creator")} defaultValue={school.creatorName} maxLength={20} />
          <FieldMessage state={state} name="creatorName" id="school-creator" />
        </div>
      </div>
      <FormNotice state={state} />
      <div className={ui.formActions}>
        <SubmitButton pending={pending} pendingLabel="저장하는 중">
          스쿨 정보 저장
        </SubmitButton>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
import { BOARD_CATEGORY_LABEL, type BoardCategory } from "../../domain/board";
import { writePost } from "../../server/actions";
import { buttonClass } from "../ui/button";
import { SelectField, TextAreaField, TextField } from "../ui/fields";
import { FormMessage } from "../ui/FormMessage";
import { useFormSubmit } from "../ui/useFormSubmit";
import styles from "./board.module.css";

/** 글쓰기 opens inline above the list; posting takes you to the new post. */
export function PostComposer({ as, categories }: { as: "editor" | "reader"; categories: BoardCategory[] }) {
  const [open, setOpen] = useState(false);
  const { state, pending, formRef, onSubmit, action, fieldError } = useFormSubmit(writePost);
  return (
    <div className={styles.composer}>
      <button
        type="button"
        className={buttonClass(open ? "secondary" : "primary")}
        aria-expanded={open}
        aria-controls="post-composer"
        onClick={() => setOpen((value) => !value)}
      >
        <PenLine size={16} aria-hidden />
        {open ? "글쓰기 닫기" : "글쓰기"}
      </button>
      {open && (
        <form ref={formRef} action={action} onSubmit={onSubmit} id="post-composer" className={styles.composerForm} aria-label="새 글">
          <input type="hidden" name="as" value={as} />
          <div className={styles.composerRow}>
            <SelectField label="말머리" name="category" defaultValue={categories[0]} error={fieldError("category")}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {BOARD_CATEGORY_LABEL[category]}
                </option>
              ))}
            </SelectField>
            <TextField label="제목" name="title" required maxLength={80} error={fieldError("title")} autoFocus />
          </div>
          <TextAreaField label="내용" name="body" required rows={6} maxLength={4000} error={fieldError("body")} />
          <div className={styles.composerActions}>
            <button type="submit" className={buttonClass("primary")} disabled={pending}>
              {pending ? "올리는 중…" : "올리기"}
            </button>
            <FormMessage state={state} showSuccess={false} />
          </div>
        </form>
      )}
    </div>
  );
}

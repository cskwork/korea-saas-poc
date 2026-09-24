"use client";

import clsx from "clsx";
import type { Course } from "../../db/schema";
import { CATEGORIES, COURSE_COLORS } from "../../domain/catalog";
import { createCourseAction, updateCourseAction } from "../../server/actions";
import { FieldMessage, fieldAttrs, FormNotice, SubmitButton, useFormAction } from "../ui/form";
import ui from "../ui/ui.module.css";
import styles from "./courses.module.css";

type Defaults = Pick<Course, "title" | "description" | "category" | "color" | "listPrice" | "price" | "outcomes">;

/** Create or edit a course's storefront facts (title, category, colour, prices, outcomes). */
export function CourseForm({ courseId, defaults }: { courseId?: string; defaults: Defaults }) {
  const { state, pending, formProps } = useFormAction(courseId ? updateCourseAction : createCourseAction);
  const id = (name: string) => `course-${name}`;

  return (
    <form {...formProps} className={ui.form} noValidate>
      {courseId ? <input type="hidden" name="courseId" value={courseId} /> : null}

      <div className={ui.field}>
        <label className={ui.label} htmlFor={id("title")}>
          강의 제목
        </label>
        <input
          className={ui.input}
          {...fieldAttrs(state, "title", id("title"))}
          defaultValue={defaults.title}
          placeholder="예: 실전 JavaScript 완전 정복"
          maxLength={80}
          required
        />
        <FieldMessage state={state} name="title" id={id("title")} />
      </div>

      <div className={ui.field}>
        <label className={ui.label} htmlFor={id("description")}>
          강의 소개
        </label>
        <textarea
          className={ui.textarea}
          {...fieldAttrs(state, "description", id("description"), id("description-hint"))}
          defaultValue={defaults.description}
          rows={3}
          maxLength={600}
          required
        />
        <p id={id("description-hint")} className={ui.hint}>
          스쿨 강의 페이지 맨 위에 보여요. 누구를 위한 강의인지, 끝나면 무엇을 할 수 있는지 적어 주세요.
        </p>
        <FieldMessage state={state} name="description" id={id("description")} />
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={ui.label}>카테고리</legend>
        <div className={ui.choices}>
          {CATEGORIES.map((category) => (
            <label key={category.value} className={ui.choice}>
              <input type="radio" name="category" value={category.value} defaultChecked={defaults.category === category.value} />
              <span>{category.label}</span>
            </label>
          ))}
        </div>
        <FieldMessage state={state} name="category" id={id("category")} />
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={ui.label}>블록 색</legend>
        <p className={ui.hint}>시간표, 수강생 목록, 매출 차트에서 이 강의를 알아보는 색이에요.</p>
        <div className={ui.choices}>
          {COURSE_COLORS.map((color) => (
            <label key={color.value} className={ui.choice} data-color={color.value}>
              <input type="radio" name="color" value={color.value} defaultChecked={defaults.color === color.value} />
              <span>
                <span className={ui.swatch} aria-hidden />
                {color.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={ui.formRow}>
        <div className={ui.field}>
          <label className={ui.label} htmlFor={id("listPrice")}>
            정가 (원)
          </label>
          <input
            className={ui.input}
            {...fieldAttrs(state, "listPrice", id("listPrice"))}
            defaultValue={defaults.listPrice || ""}
            inputMode="numeric"
            placeholder="129000"
            required
          />
          <FieldMessage state={state} name="listPrice" id={id("listPrice")} />
        </div>
        <div className={ui.field}>
          <label className={ui.label} htmlFor={id("price")}>
            판매가 (원)
          </label>
          <input
            className={ui.input}
            {...fieldAttrs(state, "price", id("price"), id("price-hint"))}
            defaultValue={defaults.price || ""}
            inputMode="numeric"
            placeholder="89000"
            required
          />
          <p id={id("price-hint")} className={ui.hint}>
            정가보다 낮으면 스쿨에 할인율이 표시돼요. 0원이면 무료 강의예요.
          </p>
          <FieldMessage state={state} name="price" id={id("price")} />
        </div>
      </div>

      <div className={ui.field}>
        <label className={ui.label} htmlFor={id("outcomes")}>
          이런 걸 배워요 <span className={ui.optional}>한 줄에 하나, 최대 8줄</span>
        </label>
        <textarea
          className={ui.textarea}
          {...fieldAttrs(state, "outcomes", id("outcomes"))}
          defaultValue={defaults.outcomes.join("\n")}
          rows={4}
          placeholder={"useState와 useEffect로 상태 다루기\n투두 앱을 처음부터 끝까지 만들기"}
        />
        <FieldMessage state={state} name="outcomes" id={id("outcomes")} />
      </div>

      <FormNotice state={state} />
      <div className={ui.formActions}>
        <SubmitButton pending={pending} pendingLabel={courseId ? "저장하는 중" : "만드는 중"} className={clsx(ui.primary)}>
          {courseId ? "강의 정보 저장" : "강의 만들기"}
        </SubmitButton>
      </div>
    </form>
  );
}

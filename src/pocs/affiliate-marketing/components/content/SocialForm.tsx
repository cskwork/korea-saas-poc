"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { CATEGORIES } from "../../domain/catalog";
import { generateSocialAction } from "../../server/actions";
import type { LinkOption } from "../../server/links";
import { ActionNotice, SubmitButton } from "../ui/actions";
import { Field, formStyles } from "../ui/Field";
import { useActionForm } from "../ui/useActionForm";

const format = (value: number | null) => (value == null ? "" : new Intl.NumberFormat("ko-KR").format(value));

/** SNS generator input. Picking a link fills the product fields and adds its channel-tagged short links. */
export function SocialForm({ options }: { options: LinkOption[] }) {
  const first = options.find((o) => o.status === "active");
  const [linkId, setLinkId] = useState(first?.id ?? "");
  const [name, setName] = useState(first?.productName ?? "");
  const [category, setCategory] = useState<string>(first?.category ?? CATEGORIES[0]);
  const [sale, setSale] = useState(format(first?.priceWon ?? null));
  const { state, pending, onSubmit, errors } = useActionForm(generateSocialAction);

  function pick(id: string) {
    setLinkId(id);
    const option = options.find((o) => o.id === id);
    if (!option) return;
    setName(option.productName);
    setCategory(option.category);
    setSale(format(option.priceWon));
  }

  return (
    <form onSubmit={onSubmit} className={formStyles.form} noValidate>
      <Field label="링크" optional hint={linkId ? "플랫폼마다 채널 태그가 붙은 짧은 링크가 들어가요." : "링크 없이 쓰면 게시물에 링크가 빠져요."} error={errors.linkId}>
        <select name="linkId" value={linkId} onChange={(event) => pick(event.target.value)}>
          <option value="">링크 없이 쓰기</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.productName}
            </option>
          ))}
        </select>
      </Field>
      <div className={formStyles.grid2}>
        <Field label="상품명" error={errors.productName}>
          <input name="productName" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} autoComplete="off" required />
        </Field>
        <Field label="카테고리" error={errors.category}>
          <select name="category" value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className={formStyles.grid2}>
        <Field label="정가" optional unit="원" hint="할인 전 가격이 있으면 할인율을 계산해요." error={errors.price}>
          <input name="price" inputMode="numeric" placeholder="예: 42,000" autoComplete="off" />
        </Field>
        <Field label="판매가" optional unit="원" error={errors.salePrice}>
          <input name="salePrice" inputMode="numeric" value={sale} onChange={(event) => setSale(event.target.value)} autoComplete="off" />
        </Field>
      </div>
      <Field label="강조할 점" optional hint="한 줄에 하나씩, 최대 5개" error={errors.points}>
        <textarea name="points" rows={4} placeholder={"붉은 기 진정에 바로 효과\n끈적임 없이 가벼운 제형"} />
      </Field>
      <div className={formStyles.actions}>
        <SubmitButton pending={pending} pendingLabel="게시물 쓰는 중… 최대 1분" icon={<Sparkles aria-hidden />}>
          게시물 4개 만들기
        </SubmitButton>
      </div>
      <ActionNotice state={state} />
    </form>
  );
}

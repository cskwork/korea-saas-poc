import { formatNumber } from "@/core/format";
import { LENGTH_LABEL, LENGTH_TARGET, countCharacters, lengthFit, type ContentKind, type Length } from "../../domain/content";
import { countOpenChecks } from "../../domain/templates";
import styles from "./drafts.module.css";

const FIT_TEXT = {
  short: (d: number) => `목표보다 ${formatNumber(-d)}자 짧아요`,
  long: (d: number) => `목표보다 ${formatNumber(d)}자 길어요`,
  fit: () => "목표 분량 안에 들어요",
} as const;

/** 글자수 the way writing work is measured: with and without spaces, and 200자 원고지 매수. */
export function CharCount({ body, kind, length }: { body: string; kind: ContentKind; length: Length }) {
  const count = countCharacters(body);
  const target = LENGTH_TARGET[kind][length];
  const { fit, difference } = lengthFit(count.withSpaces, target);
  const checks = countOpenChecks(body);
  const scale = target * 1.6;
  const position = (value: number) => `${Math.min(100, (value / scale) * 100)}%`;
  return (
    <>
      <dl className={styles.count}>
        <div>
          <dt>공백 포함</dt>
          <dd>{formatNumber(count.withSpaces)}자</dd>
        </div>
        <div>
          <dt>공백 제외</dt>
          <dd>{formatNumber(count.withoutSpaces)}자</dd>
        </div>
        <div>
          <dt>원고지</dt>
          <dd>{formatNumber(count.manuscriptPages, 1)}매</dd>
        </div>
      </dl>
      <div
        className={styles.fitBar}
        role="img"
        aria-label={`목표 ${formatNumber(target)}자, 지금 ${formatNumber(count.withSpaces)}자`}
      >
        <span className={styles.fitBand} style={{ left: position(target * 0.8), width: `calc(${position(target * 1.2)} - ${position(target * 0.8)})` }} />
        <span className={styles.fitMark} style={{ left: position(count.withSpaces) }} />
      </div>
      <p className={styles.fit} data-fit={fit}>
        {LENGTH_LABEL[length]} 목표 {formatNumber(target)}자 · {FIT_TEXT[fit](difference)}
      </p>
      {checks > 0 ? <p className={styles.checksBadge}>채워야 할 [확인 필요] {checks}곳</p> : <p className={styles.fit}>채울 [확인 필요] 표시가 없어요.</p>}
    </>
  );
}

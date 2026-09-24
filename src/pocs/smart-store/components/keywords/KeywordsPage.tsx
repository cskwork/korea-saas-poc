import Link from "next/link";
import clsx from "clsx";
import { X } from "lucide-react";
import { formatNumber } from "@/core/format";
import type { KeywordStat } from "../../db/schema";
import {
  COMPETITION_LABEL,
  SCORE_GRADE_LABEL,
  TREND_LABEL,
  recommendationScore,
  scoreGrade,
} from "../../domain/keywords";
import type { KeywordResearch } from "../../server/data/keywords";
import { EmptyState } from "../ui/EmptyState";
import { FilterResults, FilterScope } from "../ui/FilterScope";
import { PageHead } from "../ui/PageHead";
import { Slip } from "../ui/Slip";
import ui from "../ui/ui.module.css";
import { KeywordSearch } from "./KeywordSearch";
import { RemoveSavedButton } from "./RemoveSavedButton";
import { SaveKeywordButton } from "./SaveKeywordButton";
import styles from "./keywords.module.css";

function Score({ stat }: { stat: KeywordStat }) {
  const score = recommendationScore(stat);
  const grade = scoreGrade(score);
  return (
    <span className={clsx(styles.score, styles[`grade_${grade}`])}>
      <strong>{score}</strong>
      <span>{SCORE_GRADE_LABEL[grade]}</span>
    </span>
  );
}

function KeywordTable({
  rows,
  savedIds,
  caption,
}: {
  rows: KeywordStat[];
  savedIds: Map<string, string>;
  caption: string;
}) {
  const max = Math.max(...rows.map((r) => r.monthlyVolume), 1);
  return (
    <div className={ui.tableWrap}>
      <table className={clsx(ui.table, styles.table)}>
        <caption className={ui.visuallyHidden}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">키워드</th>
            <th scope="col" className={ui.right}>
              월간 검색량
            </th>
            <th scope="col">경쟁도</th>
            <th scope="col">트렌드</th>
            <th scope="col">추천 점수</th>
            <th scope="col">
              <span className={ui.visuallyHidden}>저장</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">
                <Link
                  href={`/smart-store/keywords?q=${encodeURIComponent(row.keyword)}`}
                  className={styles.keywordLink}
                >
                  {row.keyword}
                </Link>
              </th>
              <td className={ui.right}>
                <span className={styles.volume}>
                  {formatNumber(row.monthlyVolume)}
                  <span className={styles.volumeTrack} aria-hidden>
                    <span className={styles.volumeBar} style={{ width: `${(row.monthlyVolume / max) * 100}%` }} />
                  </span>
                </span>
              </td>
              <td>
                <span className={clsx(styles.level, styles[`level_${row.competition}`])}>
                  {COMPETITION_LABEL[row.competition]}
                </span>
              </td>
              <td>{TREND_LABEL[row.trend]}</td>
              <td>
                <Score stat={row} />
              </td>
              <td className={styles.saveCell}>
                <SaveKeywordButton keyword={row.keyword} savedId={savedIds.get(row.keyword)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KeywordsPage({ research }: { research: KeywordResearch }) {
  const { query, match, suggestions, saved } = research;
  const savedIds = new Map(saved.map((s) => [s.keyword, s.id]));
  const exact = match?.exact ?? null;

  return (
    <>
      <PageHead
        title="키워드 리서치"
        lede="월간 검색량, 경쟁도, 트렌드로 상품명에 넣을 키워드를 고르세요. 검색량은 샘플 데이터예요. 실제 네이버 검색량이 아니에요."
      />
      <div className={styles.layout}>
        <div className={styles.main}>
          <FilterScope>
            <KeywordSearch query={query} />
            <FilterResults>
              {exact ? (
                <>
                  <Slip
                    title={<>&ldquo;{exact.keyword}&rdquo; 분석</>}
                    titleId="keyword-title"
                    meta={<SaveKeywordButton keyword={exact.keyword} savedId={savedIds.get(exact.keyword)} />}
                  >
                    <dl className={styles.stats}>
                      <div>
                        <dt>월간 검색량</dt>
                        <dd>{formatNumber(exact.monthlyVolume)}</dd>
                      </div>
                      <div>
                        <dt>경쟁도</dt>
                        <dd>
                          <span className={clsx(styles.level, styles[`level_${exact.competition}`])}>
                            {COMPETITION_LABEL[exact.competition]}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt>트렌드</dt>
                        <dd>{TREND_LABEL[exact.trend]}</dd>
                      </div>
                      <div>
                        <dt>추천 점수</dt>
                        <dd>
                          <Score stat={exact} />
                        </dd>
                      </div>
                    </dl>
                    <p className={styles.scoreNote}>
                      추천 점수는 경쟁이 낮을수록, 검색량이 많을수록, 상승 추세일수록 높아요 (100점 만점).
                    </p>
                  </Slip>
                  <Slip
                    title="연관 키워드"
                    titleId="related-title"
                    meta="추천 점수 높은 순"
                    flush
                    className={styles.gap}
                  >
                    <KeywordTable
                      rows={match?.related ?? []}
                      savedIds={savedIds}
                      caption={`${exact.keyword} 연관 키워드`}
                    />
                  </Slip>
                </>
              ) : query ? (
                <Slip title={<>&ldquo;{query}&rdquo;</>} titleId="partial-title" flush>
                  {match?.partial.length ? (
                    <>
                      <p className={styles.partialNote}>
                        샘플 키워드 데이터에 딱 맞는 키워드가 없어 비슷한 키워드를 보여 드려요. 이름을 눌러 분석하세요.
                      </p>
                      <KeywordTable rows={match.partial} savedIds={savedIds} caption={`${query}와 비슷한 키워드`} />
                    </>
                  ) : (
                    <EmptyState title="샘플 키워드 데이터에 없는 키워드예요.">
                      아래 추천 키워드나{" "}
                      {suggestions
                        .slice(0, 3)
                        .map((s) => s.keyword)
                        .join(", ")}{" "}
                      같은 키워드로 분석해 보세요.
                    </EmptyState>
                  )}
                </Slip>
              ) : null}
              {!exact ? (
                <Slip
                  title="지금 노려볼 만한 키워드"
                  titleId="suggest-title"
                  meta="대표 키워드 · 추천 점수 순"
                  flush
                  className={query ? styles.gap : undefined}
                >
                  <KeywordTable rows={suggestions} savedIds={savedIds} caption="추천 대표 키워드" />
                </Slip>
              ) : null}
            </FilterResults>
          </FilterScope>
        </div>

        <Slip title="저장한 키워드" titleId="saved-title" meta={`${saved.length}개`} className={styles.saved} flush>
          {saved.length === 0 ? (
            <EmptyState title="저장한 키워드가 없어요.">
              분석 결과에서 &lsquo;저장&rsquo;을 누르면 상품명을 쓸 때 꺼내 볼 수 있어요.
            </EmptyState>
          ) : (
            <ul className={styles.savedList}>
              {saved.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/smart-store/keywords?q=${encodeURIComponent(item.keyword)}`}
                    className={styles.savedKeyword}
                  >
                    {item.keyword}
                  </Link>
                  <span className={styles.savedMeta}>
                    {item.stat
                      ? `월 ${formatNumber(item.stat.monthlyVolume)} · 경쟁 ${COMPETITION_LABEL[item.stat.competition]}`
                      : "데이터 없음"}
                  </span>
                  <RemoveSavedButton
                    id={item.id}
                    keyword={item.keyword}
                    icon={<X size={14} strokeWidth={2} aria-hidden />}
                  />
                </li>
              ))}
            </ul>
          )}
        </Slip>
      </div>
    </>
  );
}

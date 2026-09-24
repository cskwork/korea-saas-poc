import { ORDER_TYPES, ORDER_TYPE_INFO, type OrderType } from "../../domain/catalog";
import {
  AI_TOOLS,
  DIFFICULTY_LABEL,
  TOOL_PRICING_LABEL,
  TOOL_USE_LABEL,
  TOOL_USES,
  toolUsage,
  type ToolUse,
} from "../../domain/tools";
import { paths } from "../paths";
import { HeaderCell, SheetHeader } from "../SheetHeader";
import styles from "./tools.module.css";

interface ToolMatrixProps {
  use?: ToolUse;
  orders: { type: OrderType; tools: string[] }[];
}

/** Tools × order types: which tool is in the kit for which work, and how often this studio used it. */
export function ToolMatrix({ use, orders }: ToolMatrixProps) {
  const usage = toolUsage(orders);
  const tools = use ? AI_TOOLS.filter((t) => t.uses.includes(use)) : AI_TOOLS;

  return (
    <>
      <SheetHeader
        title="AI 도구 비교"
        lead="작업 종류마다 어떤 도구를 쓰는지, 이 스튜디오 주문에서 실제로 몇 번 썼는지 한 표로 봐요. 요금과 이용 조건은 자주 바뀌니 쓰기 전에 공식 사이트에서 확인하세요."
      >
        <HeaderCell label="전체" value={`${AI_TOOLS.length}개`} href={paths.tools} current={!use} />
        {TOOL_USES.map((u) => (
          <HeaderCell
            key={u}
            label={TOOL_USE_LABEL[u]}
            value={`${AI_TOOLS.filter((t) => t.uses.includes(u)).length}개`}
            href={`${paths.tools}?use=${u}`}
            current={use === u}
          />
        ))}
      </SheetHeader>

      <div className={styles.body}>
        <p className={styles.legend}>
          <span className={styles.keyKit} aria-hidden="true" /> 기본 도구 세트
          <span className={styles.keyCount}>12</span> 이 종류 주문에서 쓴 횟수
        </p>
        <div
          className={styles.scroller}
          tabIndex={0}
          role="region"
          aria-label="도구와 작업 종류 비교표 (가로로 스크롤)"
        >
          <table className={styles.matrix}>
            <caption className={styles.caption}>도구별 요금, 난이도, 작업 종류별 쓰임</caption>
            <thead>
              <tr>
                <th scope="col" className={styles.toolHead}>
                  도구
                </th>
                <th scope="col">요금</th>
                <th scope="col">난이도</th>
                {ORDER_TYPES.map((type) => (
                  <th key={type} scope="col" className={styles.typeHead}>
                    {ORDER_TYPE_INFO[type].short}
                  </th>
                ))}
                <th scope="col" className={styles.num}>
                  우리 주문
                </th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => {
                const used = usage.get(tool.name);
                return (
                  <tr key={tool.name}>
                    <th scope="row" className={styles.toolCell}>
                      <span className={styles.toolName}>{tool.name}</span>
                      <span className={styles.toolUses}>{tool.uses.map((u) => TOOL_USE_LABEL[u]).join(" · ")}</span>
                    </th>
                    <td className={styles.pricing} data-pricing={tool.pricing}>
                      {TOOL_PRICING_LABEL[tool.pricing]}
                    </td>
                    <td>
                      <span className={styles.difficulty} aria-label={`난이도 ${DIFFICULTY_LABEL[tool.difficulty]}`}>
                        {[1, 2, 3].map((step) => (
                          <span
                            key={step}
                            className={styles.step}
                            data-on={step <= tool.difficulty}
                            aria-hidden="true"
                          />
                        ))}
                        <span aria-hidden="true">{DIFFICULTY_LABEL[tool.difficulty]}</span>
                      </span>
                    </td>
                    {ORDER_TYPES.map((type) => {
                      const inKit = tool.kitFor.includes(type);
                      const count = used?.byType[type] ?? 0;
                      return (
                        <td key={type} className={styles.mark}>
                          {(inKit || count > 0) && (
                            <span className={styles.markInner}>
                              <span className={inKit ? styles.keyKit : styles.keyUsed} aria-hidden="true" />
                              {count > 0 && <span className={styles.count}>{count}</span>}
                              <span className={styles.srOnly}>
                                {inKit ? "기본 도구" : "기본 도구 아님"}
                                {count > 0 ? `, ${count}건 사용` : ""}
                              </span>
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className={styles.num}>{used?.total ?? 0}건</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h2 className={styles.notesTitle}>도구별 메모</h2>
        <dl className={styles.notes}>
          {tools.map((tool) => (
            <div key={tool.name} className={styles.note}>
              <dt className={styles.noteName}>{tool.name}</dt>
              <dd className={styles.noteText}>{tool.note}</dd>
              <dd className={styles.noteStrengths}>{tool.strengths.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}

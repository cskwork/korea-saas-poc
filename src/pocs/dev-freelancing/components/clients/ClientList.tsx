import Link from "next/link";
import { formatRelative, formatWon } from "@/core/format";
import { CLIENT_GRADE_LABEL, CLIENT_GRADES, type ClientGrade } from "../../domain/labels";
import type { ClientRow, ClientSort } from "../../server/data/clients";
import { buttonClass } from "../ui/button";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import ui from "../ui/ui.module.css";
import { NewClientPanel } from "./ClientEditors";
import styles from "./Clients.module.css";

const SORT_LABEL: Record<ClientSort, string> = { recent: "최근 거래순", revenue: "누적 입금순", name: "이름순" };

export function ClientList({
  clients,
  all,
  filter,
}: {
  clients: ClientRow[];
  all: ClientRow[];
  filter: { q: string; grade: ClientGrade | ""; sort: ClientSort };
}) {
  const outstanding = all.reduce((sum, c) => sum + c.outstanding, 0);
  const vip = all.filter((c) => c.grade === "vip").length;
  const filtered = filter.q !== "" || filter.grade !== "";
  return (
    <div className={styles.page}>
      <PageHeader
        title="고객"
        description={`${all.length}명 · VIP ${vip}명 · 받을 돈 ${formatWon(outstanding)}`}
      />
      <NewClientPanel />
      <form method="get" className={styles.filters} role="search" aria-label="고객 찾기">
        <label className={styles.filterField}>
          <span className={ui.label}>검색</span>
          <input className={ui.input} type="search" name="q" defaultValue={filter.q} placeholder="이름, 회사, 이메일, 연락처" />
        </label>
        <label className={styles.filterField}>
          <span className={ui.label}>등급</span>
          <select className={ui.select} name="grade" defaultValue={filter.grade}>
            <option value="">전체</option>
            {CLIENT_GRADES.map((grade) => (
              <option key={grade} value={grade}>
                {CLIENT_GRADE_LABEL[grade]}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filterField}>
          <span className={ui.label}>정렬</span>
          <select className={ui.select} name="sort" defaultValue={filter.sort}>
            {(Object.keys(SORT_LABEL) as ClientSort[]).map((sort) => (
              <option key={sort} value={sort}>
                {SORT_LABEL[sort]}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.filterActions}>
          <button type="submit" className={buttonClass("secondary")}>
            적용
          </button>
          {filtered ? (
            <Link href="/dev-freelancing/clients" className={buttonClass("ghost")}>
              초기화
            </Link>
          ) : null}
        </div>
      </form>

      {clients.length === 0 ? (
        <EmptyState title={filtered ? "조건에 맞는 고객이 없어요" : "아직 고객이 없어요"}>
          {filtered ? "검색어나 등급을 바꿔 보세요." : "‘새 고객’으로 등록하거나, 공개 페이지로 들어온 문의가 여기에 자동으로 쌓여요."}
        </EmptyState>
      ) : (
        <div className={ui.tableWrap}>
          <table className={ui.table}>
            <caption className={styles.caption}>
              {filtered ? `${clients.length}명 찾음` : `고객 ${clients.length}명`} · {SORT_LABEL[filter.sort]}
            </caption>
            <thead>
              <tr>
                <th scope="col">고객</th>
                <th scope="col">등급</th>
                <th scope="col" className={ui.num}>
                  프로젝트
                </th>
                <th scope="col" className={ui.num}>
                  누적 입금
                </th>
                <th scope="col" className={ui.num}>
                  받을 돈
                </th>
                <th scope="col">최근 활동</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className={styles.who}>
                      <span className={styles.initial} aria-hidden="true">
                        {client.name.slice(0, 1)}
                      </span>
                      <div>
                        <Link href={`/dev-freelancing/clients/${client.id}`} className={ui.rowLink}>
                          {client.name}
                        </Link>
                        <p className={ui.muted}>{client.company || client.email || "회사 정보 없음"}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={ui.tag} data-tone={client.grade === "vip" ? "accent" : undefined}>
                      {CLIENT_GRADE_LABEL[client.grade]}
                    </span>
                  </td>
                  <td className={ui.num}>
                    {client.activeProjects > 0 ? <span className={styles.active}>진행 {client.activeProjects} · </span> : null}
                    {client.projectCount}건
                  </td>
                  <td className={ui.num}>{formatWon(client.paid)}</td>
                  <td className={ui.num}>{client.outstanding > 0 ? <strong>{formatWon(client.outstanding)}</strong> : <span className={ui.muted}>—</span>}</td>
                  <td className={ui.muted}>{formatRelative(`${client.lastActivity}T12:00:00+09:00`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

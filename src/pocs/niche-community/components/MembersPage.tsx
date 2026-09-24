import Form from "next/form";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatRelative } from "@/core/format";
import type { DirectoryFilter } from "../server/data/members";
import type { getMembersPage } from "../server/queries";
import { Avatar } from "./Avatar";
import { personaLabel } from "./labels";
import styles from "./members.module.css";
import ui from "./ui.module.css";

type MembersData = Awaited<ReturnType<typeof getMembersPage>>;

const FILTERS: { value: DirectoryFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "operator", label: "운영자" },
  { value: "premium", label: "프리미엄" },
  { value: "free", label: "무료" },
];

/** The team slide: everyone in the room, most recently active first. */
export function MembersPage({ data }: { data: MembersData }) {
  const { entries, counts, filter, search, now, viewer } = data;
  const href = (value: DirectoryFilter, keepSearch = true) => {
    const params = new URLSearchParams();
    if (value !== "all") params.set("tier", value);
    if (search && keepSearch) params.set("q", search);
    const query = params.toString();
    return `/niche-community/members${query ? `?${query}` : ""}`;
  };

  return (
    <div className={`${ui.page} ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={ui.pageTitle}>멤버 {counts.all}명</h1>
        <p className={ui.pageLead}>최근에 활동한 순서예요. 이름을 누르면 프로필과 뱃지 이력을 볼 수 있어요. 모두 샘플 멤버입니다.</p>
      </header>
      <div className={styles.controls}>
        <nav aria-label="멤버 구분" className={styles.tabs}>
          {FILTERS.map((item) => (
            <Link key={item.value} href={href(item.value)} aria-current={filter === item.value ? "page" : undefined} scroll={false}>
              {item.label} <span className={styles.tabCount}>{counts[item.value]}</span>
            </Link>
          ))}
        </nav>
        <Form action="/niche-community/members" className={styles.search} role="search" scroll={false}>
          {filter !== "all" ? <input type="hidden" name="tier" value={filter} /> : null}
          <label htmlFor="nc-member-search" className={ui.srOnly}>
            멤버 검색
          </label>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <input
            id="nc-member-search"
            name="q"
            type="search"
            defaultValue={search}
            maxLength={30}
            placeholder="이름이나 하는 일로 찾기"
            className={`${ui.input} ${styles.searchInput}`}
          />
        </Form>
      </div>
      {entries.length ? (
        <ul className={`${ui.slide} ${styles.team}`} role="list">
          {entries.map((member) => (
            <li key={member.id}>
              <Link href={`/niche-community/members/${member.id}`} className={styles.person}>
                <Avatar id={member.id} nickname={member.nickname} size="lg" operator={member.role === "operator"} />
                <span className={styles.personText}>
                  <span className={styles.personName}>
                    {member.nickname}
                    {member.id === viewer.id ? <span className={styles.you}>나</span> : null}
                  </span>
                  <span className={styles.personHeadline}>{member.headline || "소개가 아직 없어요"}</span>
                  <span className={styles.personMeta}>
                    <span className={member.role === "member" && member.tier === "free" ? ui.tag : `${ui.tag} ${ui.tagInk}`}>
                      {personaLabel(member)}
                    </span>
                    <span className={ui.num}>
                      글 {member.postCount} · 뱃지 {member.badgeCount}
                    </span>
                  </span>
                  <span className={styles.personActive}>
                    {member.lastActiveAt ? `${formatRelative(member.lastActiveAt, now)} 활동` : "아직 활동 없음"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className={`${ui.slide} ${styles.empty}`}>
          <p className={styles.emptyTitle}>‘{search}’에 맞는 멤버가 없어요</p>
          <Link href={href(filter, false)} className={`${ui.button} ${ui.small}`}>
            검색 지우기
          </Link>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDate, formatNumber, formatRelative } from "@/core/format";
import { switchPersonaAction } from "../server/actions";
import type { getMemberPage } from "../server/queries";
import { ActionButton } from "./ActionButtons";
import { Avatar } from "./Avatar";
import { BadgeIcon } from "./BadgeIcon";
import { ProfileForm } from "./ProfileForm";
import { personaLabel } from "./labels";
import styles from "./members.module.css";
import ui from "./ui.module.css";

type MemberData = NonNullable<Awaited<ReturnType<typeof getMemberPage>>>;

/** A member's team slide, their milestone timeline (badges with real dates) and latest posts. */
export function MemberPage({ data }: { data: MemberData }) {
  const { profile, posts, isViewer, now } = data;
  const { member, stats, earned, badges } = profile;
  const pending = badges.filter((badge) => badge.earnedAt === null && badge.target !== undefined);

  return (
    <div className={`${ui.page} ${styles.profilePage}`}>
      <Link href="/niche-community/members" className={styles.back}>
        <ArrowLeft size={16} aria-hidden="true" />
        멤버 목록
      </Link>

      <section className={`${ui.slide} ${styles.hero}`} aria-labelledby="nc-member-name">
        <Avatar id={member.id} nickname={member.nickname} size="xl" operator={member.role === "operator"} />
        <div className={styles.heroText}>
          <h1 id="nc-member-name" className={styles.heroName}>
            {member.nickname}
          </h1>
          <p className={styles.heroHeadline}>{member.headline || "한 줄 소개가 아직 없어요"}</p>
          {member.bio ? <p className={styles.heroBio}>{member.bio}</p> : null}
          <p className={styles.heroMeta}>
            <span className={member.role === "member" && member.tier === "free" ? ui.tag : `${ui.tag} ${ui.tagInk}`}>
              {personaLabel(member)}
            </span>
            <span>{formatDate(member.joinedAt)} 합류</span>
            {profile.lastActiveAt ? <span>{formatRelative(profile.lastActiveAt, now)} 활동</span> : null}
          </p>
          {isViewer ? (
            <p className={styles.wearing}>지금 이 명찰을 달고 있어요.</p>
          ) : (
            <ActionButton run={switchPersonaAction.bind(null, { memberId: member.id })} pendingLabel="바꾸는 중…">
              이 명찰로 보기
            </ActionButton>
          )}
        </div>
        <dl className={styles.stats}>
          {[
            ["글", stats.posts],
            ["댓글", stats.comments],
            ["받은 좋아요", stats.likesReceived],
            ["모임 참석", stats.meetups],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd className={ui.num}>{formatNumber(Number(value))}</dd>
            </div>
          ))}
        </dl>
      </section>

      {isViewer ? (
        <details className={`${ui.slide} ${styles.edit}`}>
          <summary className={styles.editSummary}>내 프로필 고치기</summary>
          <ProfileForm nickname={member.nickname} headline={member.headline} bio={member.bio} />
        </details>
      ) : null}

      <section className={styles.milestones} aria-labelledby="nc-milestones">
        <h2 id="nc-milestones" className={ui.sectionTitle}>
          {earned.length ? `뱃지 ${earned.length}개를 이 순서로 모았어요` : "아직 받은 뱃지가 없어요"}
        </h2>
        {earned.length ? (
          <ol className={styles.timeline}>
            {earned.map((badge) => (
              <li key={badge.key} className={styles.milestone}>
                <span className={styles.node}>
                  <BadgeIcon badge={badge.key} size={18} />
                </span>
                <span className={styles.milestoneName}>{badge.name}</span>
                <time className={styles.milestoneDate} dateTime={badge.earnedAt.toISOString()}>
                  {formatDate(badge.earnedAt)}
                </time>
                <span className={styles.milestoneDesc}>{badge.description}</span>
              </li>
            ))}
          </ol>
        ) : null}
        {pending.length ? (
          <ul className={styles.progressList} role="list" aria-label="진행 중인 뱃지">
            {pending.map((badge) => (
              <li key={badge.key} className={styles.progressItem}>
                <BadgeIcon badge={badge.key} size={16} className={styles.progressIcon} />
                <span className={styles.progressName}>{badge.name}</span>
                <span className={styles.progressDesc}>{badge.description}</span>
                <span className={styles.progressBar} aria-hidden="true">
                  <span style={{ width: `${((badge.current ?? 0) / (badge.target ?? 1)) * 100}%` }} />
                </span>
                <span className={`${styles.progressValue} ${ui.num}`}>
                  {badge.current} / {badge.target}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className={styles.recent} aria-labelledby="nc-member-posts">
        <h2 id="nc-member-posts" className={ui.sectionTitle}>
          최근 글
        </h2>
        {posts.length ? (
          <ul className={`${ui.slide} ${styles.postList}`} role="list">
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/niche-community/posts/${post.id}`} className={styles.postLink}>
                  <span className={styles.postTitle}>{post.title}</span>
                  <span className={styles.postMeta}>
                    {post.channel.name} · {formatRelative(post.createdAt, now)} · 좋아요 {post.likeCount} · 댓글 {post.commentCount}
                    {post.premiumOnly ? " · 대외비" : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={ui.status}>아직 쓴 글이 없어요.</p>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { Layers, Lock } from "lucide-react";
import { feedSearch, type FeedQuery } from "../domain/inputs";
import type { ChannelSummary } from "../server/types";
import { ChannelIcon } from "./ChannelIcon";
import styles from "./agenda.module.css";

/** Channels as the deck's agenda: current in ink with the laser dot, others dimmed, 대외비 floors locked. */
export function ChannelAgenda({ channels, query, total }: { channels: ChannelSummary[]; query: FeedQuery; total: number }) {
  const href = (channelId: string | null) =>
    `/niche-community${feedSearch({ channelId, sort: query.sort, q: query.q })}`;
  return (
    <nav className={styles.agenda} aria-label="채널">
      <h2 className={styles.heading}>채널</h2>
      <ul role="list" className={styles.list}>
        <li>
          <Link href={href(null)} className={styles.item} aria-current={query.channelId === null ? "page" : undefined}>
            <span className={styles.dot} aria-hidden="true" />
            <Layers size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className={styles.name}>모든 채널</span>
            <span className={styles.count}>{total}</span>
          </Link>
        </li>
        {channels.map((channel) => (
          <li key={channel.id}>
            <Link
              href={href(channel.id)}
              className={styles.item}
              aria-current={query.channelId === channel.id ? "page" : undefined}
            >
              <span className={styles.dot} aria-hidden="true" />
              <ChannelIcon icon={channel.icon} />
              <span className={styles.name}>{channel.name}</span>
              {channel.access === "premium" ? <Lock size={13} className={styles.lock} aria-label="대외비 채널" /> : null}
              <span className={styles.count}>{channel.postCount}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

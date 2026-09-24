"use client";

import { useEffect } from "react";
import { KIND_LABEL, type ContentKind } from "../../domain/content";
import { Grommets } from "../shell/Grommets";
import styles from "./proof.module.css";

/** Splits the title around the first keyword it contains: the banner's highlighted word. */
function emphasise(title: string, keywords: readonly string[]): React.ReactNode {
  const keyword = keywords.find((k) => k && title.includes(k));
  if (!keyword) return title;
  const at = title.indexOf(keyword);
  return (
    <>
      {title.slice(0, at)}
      <em>{keyword}</em>
      {title.slice(at + keyword.length)}
    </>
  );
}

/**
 * A draft's title as a street-banner proof (시안). With `unfurl`, it unrolls from the
 * left edge the moment it is written; remount it (change its key) to play again.
 */
export function BannerProof({
  title,
  kind,
  keywords = [],
  byline,
  size = "hero",
  unfurl = false,
  headingLevel,
}: {
  title: string;
  kind: ContentKind;
  keywords?: readonly string[];
  byline?: string;
  size?: "hero" | "compact";
  unfurl?: boolean;
  /** Render the headline as a heading element (the page's h1 on a draft page). */
  headingLevel?: 1 | 2 | 3;
}) {
  useEffect(() => {
    // A fresh proof arrives with ?fresh=1; drop it so a reload does not replay the unroll.
    if (!unfurl || !window.location.search.includes("fresh=")) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("fresh");
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
  }, [unfurl]);

  const Headline = headingLevel ? (`h${headingLevel}` as const) : "p";
  const className = [styles.proof, size === "compact" ? styles.compact : "", unfurl ? styles.unfurl : ""].filter(Boolean).join(" ");
  return (
    <figure className={className} data-kind={kind} aria-label={`${KIND_LABEL[kind]} 시안`}>
      <div className={styles.field}>
        <Headline className={styles.headline}>{emphasise(title, keywords)}</Headline>
        {byline ? <p className={styles.byline}>{byline}</p> : null}
        <Grommets className={styles.grommets} />
      </div>
    </figure>
  );
}

import { Fragment, type ReactNode } from "react";
import type { Block, Inline } from "../../domain/markup";
import styles from "./issue.module.css";

function Inlines({ inlines }: { inlines: Inline[] }) {
  return (
    <>
      {inlines.map((inline, i) => {
        if (inline.kind === "strong") return <strong key={i}>{inline.text}</strong>;
        if (inline.kind === "link")
          return (
            <a key={i} href={inline.href} target="_blank" rel="noopener noreferrer nofollow">
              {inline.text}
            </a>
          );
        return <Fragment key={i}>{inline.text}</Fragment>;
      })}
    </>
  );
}

/**
 * The typeset body of an issue. `marker` is inserted after `markerAfter`
 * blocks (the editor's proof shows where the free preview ends).
 */
export function IssueBody({
  blocks,
  markerAfter,
  marker,
}: {
  blocks: Block[];
  markerAfter?: number;
  marker?: ReactNode;
}) {
  return (
    <div className={styles.body}>
      {blocks.map((block, i) => (
        <Fragment key={i}>
          {/* Where the marker stands in for the preview's end, the divider it replaces is not repeated. */}
          {!(marker && markerAfter === i && block.kind === "divider") && renderBlock(block)}
          {marker && markerAfter === i + 1 && i + 1 < blocks.length && marker}
        </Fragment>
      ))}
    </div>
  );
}

function renderBlock(block: Block) {
  switch (block.kind) {
    case "heading":
      return (
        <h2 className={styles.heading}>
          <Inlines inlines={block.inlines} />
        </h2>
      );
    case "paragraph":
      return (
        <p className={styles.paragraph}>
          <Inlines inlines={block.inlines} />
        </p>
      );
    case "quote":
      return (
        <blockquote className={styles.quote}>
          <p>
            <Inlines inlines={block.inlines} />
          </p>
        </blockquote>
      );
    case "list":
      return (
        <ul className={styles.list}>
          {block.items.map((item, j) => (
            <li key={j}>
              <Inlines inlines={item} />
            </li>
          ))}
        </ul>
      );
    case "divider":
      return <hr className={styles.divider} />;
  }
}

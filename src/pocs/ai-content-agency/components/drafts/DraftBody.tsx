import { parseBody } from "../../domain/content";
import styles from "./drafts.module.css";

const CHECK = /(\[확인 필요[^\]]*\])/g;

/** Marks "[확인 필요: …]" slots so the editor sees what is still missing. */
function withChecks(text: string): React.ReactNode {
  const parts = text.split(CHECK);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className={styles.check}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

/** A draft's body as readable copy: headings, lists, paragraphs. */
export function DraftBody({ body }: { body: string }) {
  return (
    <div className={styles.body}>
      {parseBody(body).map((block, i) => {
        if (block.type === "heading") return <h3 key={i}>{withChecks(block.text)}</h3>;
        if (block.type === "list")
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{withChecks(item)}</li>
              ))}
            </ul>
          );
        return <p key={i}>{withChecks(block.text)}</p>;
      })}
    </div>
  );
}

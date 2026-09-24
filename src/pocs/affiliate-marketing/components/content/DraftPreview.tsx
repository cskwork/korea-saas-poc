import { Fragment } from "react";
import { inlineSegments, parseDraft } from "../../domain/draft-format";
import styles from "./content.module.css";

const URL_PATTERN = /(https?:\/\/[^\s<>"')]+)/g;

function Inline({ text }: { text: string }) {
  return (
    <>
      {inlineSegments(text).map((segment, index) => {
        const parts = segment.split(URL_PATTERN).map((part, i) =>
          i % 2 === 1 ? (
            <a key={i} href={part} rel="sponsored nofollow noopener" target="_blank">
              {part}
            </a>
          ) : (
            <Fragment key={i}>{part}</Fragment>
          ),
        );
        return index % 2 === 1 ? <strong key={index}>{parts}</strong> : <Fragment key={index}>{parts}</Fragment>;
      })}
    </>
  );
}

/** Renders a draft as the blog post it will become (no HTML injection: parsed blocks only). */
export function DraftPreview({ title, body }: { title: string; body: string }) {
  const blocks = parseDraft(body);
  return (
    <article className={styles.post} aria-label="미리보기">
      <h2 className={styles.postTitle}>{title}</h2>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const Tag = block.level === 3 ? "h4" : "h3";
            return (
              <Tag key={index}>
                <Inline text={block.text} />
              </Tag>
            );
          }
          case "paragraph":
            return (
              <p key={index}>
                <Inline text={block.text} />
              </p>
            );
          case "quote":
            return (
              <blockquote key={index}>
                <Inline text={block.text} />
              </blockquote>
            );
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag key={index}>
                {block.items.map((item, i) => (
                  <li key={i}>
                    <Inline text={item} />
                  </li>
                ))}
              </Tag>
            );
          }
          case "table":
            return (
              <div key={index} className={styles.postTable}>
                <table>
                  <thead>
                    <tr>
                      {block.header.map((cell, i) => (
                        <th key={i} scope="col">
                          <Inline text={cell} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td key={c}>
                            <Inline text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </article>
  );
}

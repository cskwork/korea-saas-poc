"use client";

import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import { useActionState, useState } from "react";
import { idleState } from "@/core/actions";
import { deletePortfolioItem, movePortfolioItem, savePortfolioItem, setPortfolioPublished } from "../../server/actions";
import type { PortfolioItem } from "../../server/data/showcase";
import { ActionButton } from "../ui/ActionButton";
import { buttonClass } from "../ui/button";
import { EmptyState } from "../ui/EmptyState";
import { FormMessage } from "../ui/FormMessage";
import { SubmitButton } from "../ui/SubmitButton";
import ui from "../ui/ui.module.css";
import { PortfolioForm } from "./PortfolioForm";
import styles from "./Showcase.module.css";

interface Candidate {
  id: string;
  title: string;
  description: string;
  company: string | null;
}

/** Portfolio builder: add, import a finished project, edit, reorder, publish or hide, delete. */
export function PortfolioEditor({
  items,
  candidates,
  projects,
}: {
  items: PortfolioItem[];
  candidates: Candidate[];
  projects: { id: string; title: string }[];
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className={styles.editor}>
      <div className={styles.tools}>
        <button type="button" className={buttonClass(adding ? "ghost" : "primary")} aria-expanded={adding} onClick={() => setAdding((v) => !v)}>
          {adding ? <X size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
          {adding ? "닫기" : "새 항목"}
        </button>
        {candidates.length > 0 ? <ImportForm candidates={candidates} /> : null}
      </div>
      {adding ? (
        <div className={styles.formPanel}>
          <PortfolioForm projects={projects} onDone={() => setAdding(false)} />
        </div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState title="포트폴리오가 비어 있어요">완료한 프로젝트를 가져오거나 새 항목을 추가하면 공개 페이지에 보여요.</EmptyState>
      ) : (
        <ol role="list" className={styles.items}>
          {items.map((item, index) =>
            editing === item.id ? (
              <li key={item.id} className={styles.formPanel}>
                <PortfolioForm item={item} projects={projects} onDone={() => setEditing(null)} />
              </li>
            ) : (
              <li key={item.id} className={styles.item} data-hidden={item.published ? undefined : ""}>
                <div className={styles.itemMain}>
                  <div className={styles.itemHead}>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    <span className={ui.tag} data-tone={item.published ? "accent" : undefined}>
                      {item.published ? "공개" : "숨김"}
                    </span>
                  </div>
                  <p className={styles.itemMeta}>{[item.period, item.role].filter(Boolean).join(" · ")}</p>
                  {item.summary ? <p className={styles.itemText}>{item.summary}</p> : null}
                  {item.outcome ? (
                    <p className={styles.itemOutcome}>
                      <strong>결과</strong> {item.outcome}
                    </p>
                  ) : null}
                  {item.stack.length > 0 ? (
                    <ul role="list" className={styles.stack}>
                      {item.stack.map((tech) => (
                        <li key={tech} className={ui.tag}>
                          {tech}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {item.url ? (
                    <a href={item.url} className={ui.textLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={13} aria-hidden="true" />
                      {item.url.replace(/^https?:\/\//, "")}
                    </a>
                  ) : null}
                </div>
                <div className={styles.itemActions}>
                  <ActionButton action={setPortfolioPublished} payload={{ id: item.id, published: !item.published }} small>
                    {item.published ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                    {item.published ? "숨기기" : "공개하기"}
                  </ActionButton>
                  <ActionButton action={movePortfolioItem} payload={{ id: item.id, direction: -1 as const }} small iconOnly variant="ghost" label="위로" disabled={index === 0}>
                    <ArrowUp size={14} aria-hidden="true" />
                  </ActionButton>
                  <ActionButton
                    action={movePortfolioItem}
                    payload={{ id: item.id, direction: 1 as const }}
                    small
                    iconOnly
                    variant="ghost"
                    label="아래로"
                    disabled={index === items.length - 1}
                  >
                    <ArrowDown size={14} aria-hidden="true" />
                  </ActionButton>
                  <button type="button" className={buttonClass("ghost", { small: true, iconOnly: true })} aria-label={`${item.title} 고치기`} title="고치기" onClick={() => setEditing(item.id)}>
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                  <ActionButton action={deletePortfolioItem} payload={{ id: item.id }} small iconOnly variant="danger" label={`${item.title} 삭제`} confirm="지울까요?" confirmLabel="삭제">
                    <Trash2 size={14} aria-hidden="true" />
                  </ActionButton>
                </div>
              </li>
            ),
          )}
        </ol>
      )}
    </div>
  );
}

/** Starts a hidden entry from a finished project (title and description carried over). */
function ImportForm({ candidates }: { candidates: Candidate[] }) {
  const [state, formAction] = useActionState(savePortfolioItem, idleState);
  const [selected, setSelected] = useState(candidates[0]?.id ?? "");
  const candidate = candidates.find((c) => c.id === selected);
  return (
    <form action={formAction} className={styles.import}>
      <label htmlFor="pf-import" className={ui.label}>
        완료한 프로젝트 가져오기
      </label>
      <div className={styles.importRow}>
        <select id="pf-import" className={ui.select} value={selected} onChange={(event) => setSelected(event.target.value)}>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <input type="hidden" name="projectId" value={candidate?.id ?? ""} />
        <input type="hidden" name="title" value={candidate?.title ?? ""} />
        <input type="hidden" name="summary" value={candidate?.description ?? ""} />
        <input type="hidden" name="published" value="false" />
        <SubmitButton variant="secondary" pendingLabel="가져오는 중…">
          가져오기
        </SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

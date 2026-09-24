/**
 * The project pipeline (kanban): 문의 → 진행 중 → 검수 중 → 완료, ordered cards per column.
 */

export const PROJECT_STATUSES = ["inquiry", "progress", "review", "done"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PRIORITIES = ["high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

/** The column to the left (-1) or right (+1), or null at the board's edge. */
export function neighborStatus(status: ProjectStatus, direction: -1 | 1): ProjectStatus | null {
  return PROJECT_STATUSES[PROJECT_STATUSES.indexOf(status) + direction] ?? null;
}

export interface BoardCard {
  id: string;
  status: ProjectStatus;
  position: number;
}

/**
 * Moves a card to `toStatus` at `toIndex` (clamped) and renumbers positions 0…n in every column it
 * touched. Returns the whole board in column order; cards keep their other fields.
 */
export function moveCard<T extends BoardCard>(cards: readonly T[], id: string, toStatus: ProjectStatus, toIndex: number): T[] {
  const moving = cards.find((card) => card.id === id);
  if (!moving) return [...cards];

  const column = (status: ProjectStatus) =>
    cards.filter((card) => card.status === status && card.id !== id).sort((a, b) => a.position - b.position);

  const target = column(toStatus);
  const index = Math.min(Math.max(0, Math.round(toIndex)), target.length);
  target.splice(index, 0, { ...moving, status: toStatus });

  return PROJECT_STATUSES.flatMap((status) => {
    const list = status === toStatus ? target : column(status);
    const touched = status === toStatus || status === moving.status;
    return list.map((card, position) => (touched ? { ...card, position } : card));
  });
}

/** Cards of one column in display order. */
export function columnCards<T extends BoardCard>(cards: readonly T[], status: ProjectStatus): T[] {
  return cards.filter((card) => card.status === status).sort((a, b) => a.position - b.position);
}

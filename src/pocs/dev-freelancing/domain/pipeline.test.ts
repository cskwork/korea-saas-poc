import { describe, expect, it } from "vitest";
import { columnCards, moveCard, neighborStatus, type BoardCard } from "./pipeline";

const board: BoardCard[] = [
  { id: "a", status: "inquiry", position: 0 },
  { id: "b", status: "inquiry", position: 1 },
  { id: "c", status: "progress", position: 0 },
  { id: "d", status: "progress", position: 1 },
  { id: "e", status: "done", position: 0 },
];

const ids = (cards: BoardCard[], status: BoardCard["status"]) => columnCards(cards, status).map((c) => c.id);

describe("kanban moves", () => {
  it("knows each column's neighbours", () => {
    expect(neighborStatus("inquiry", -1)).toBeNull();
    expect(neighborStatus("inquiry", 1)).toBe("progress");
    expect(neighborStatus("done", 1)).toBeNull();
  });

  it("moves a card into another column at an index and renumbers both columns", () => {
    const next = moveCard(board, "a", "progress", 1);
    expect(ids(next, "inquiry")).toEqual(["b"]);
    expect(ids(next, "progress")).toEqual(["c", "a", "d"]);
    expect(columnCards(next, "progress").map((c) => c.position)).toEqual([0, 1, 2]);
    expect(columnCards(next, "inquiry")[0].position).toBe(0);
  });

  it("reorders inside a column", () => {
    const next = moveCard(board, "d", "progress", 0);
    expect(ids(next, "progress")).toEqual(["d", "c"]);
  });

  it("clamps the index to the column length", () => {
    expect(ids(moveCard(board, "a", "done", 99), "done")).toEqual(["e", "a"]);
    expect(ids(moveCard(board, "a", "done", -3), "done")).toEqual(["a", "e"]);
  });

  it("leaves the board unchanged for an unknown card", () => {
    expect(moveCard(board, "zzz", "done", 0)).toEqual(board);
  });
});

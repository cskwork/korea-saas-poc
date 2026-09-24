import type { FrameGuide, OrderType } from "../../domain/catalog";

/**
 * The rough inside each frame, in the storyboard/layout convention: an X-box is
 * an image area, a bar is a line of copy. Coordinates are fractions of the frame.
 */

export type Shape =
  | { kind: "xbox"; x: number; y: number; w: number; h: number }
  | { kind: "bar"; x: number; y: number; w: number; h: number; strong?: boolean }
  | { kind: "box"; x: number; y: number; w: number; h: number }
  /** Circle radius is a fraction of the frame's shorter side. */
  | { kind: "circle"; cx: number; cy: number; r: number; fill?: boolean };

export type Guide =
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number }
  | { kind: "rect"; x: number; y: number; w: number; h: number }
  | { kind: "circle"; cx: number; cy: number; r: number };

export interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const ROUGH: Record<OrderType, Shape[]> = {
  thumbnail: [
    { kind: "xbox", x: 0.54, y: 0.1, w: 0.4, h: 0.8 },
    { kind: "bar", x: 0.07, y: 0.3, w: 0.4, h: 0.13, strong: true },
    { kind: "bar", x: 0.07, y: 0.48, w: 0.32, h: 0.13, strong: true },
    { kind: "bar", x: 0.07, y: 0.68, w: 0.22, h: 0.06 },
  ],
  banner: [
    { kind: "bar", x: 0.05, y: 0.26, w: 0.4, h: 0.16, strong: true },
    { kind: "bar", x: 0.05, y: 0.5, w: 0.3, h: 0.1 },
    { kind: "box", x: 0.05, y: 0.7, w: 0.14, h: 0.14 },
    { kind: "xbox", x: 0.6, y: 0.12, w: 0.34, h: 0.76 },
  ],
  detail_page: [
    { kind: "xbox", x: 0.08, y: 0.025, w: 0.84, h: 0.15 },
    { kind: "bar", x: 0.16, y: 0.2, w: 0.68, h: 0.022, strong: true },
    { kind: "bar", x: 0.24, y: 0.235, w: 0.52, h: 0.012 },
    { kind: "xbox", x: 0.08, y: 0.28, w: 0.84, h: 0.14 },
    { kind: "box", x: 0.08, y: 0.45, w: 0.25, h: 0.08 },
    { kind: "box", x: 0.375, y: 0.45, w: 0.25, h: 0.08 },
    { kind: "box", x: 0.67, y: 0.45, w: 0.25, h: 0.08 },
    { kind: "bar", x: 0.16, y: 0.57, w: 0.68, h: 0.018, strong: true },
    { kind: "bar", x: 0.12, y: 0.605, w: 0.76, h: 0.01 },
    { kind: "bar", x: 0.12, y: 0.625, w: 0.6, h: 0.01 },
    { kind: "xbox", x: 0.08, y: 0.66, w: 0.84, h: 0.16 },
    { kind: "bar", x: 0.2, y: 0.86, w: 0.6, h: 0.018 },
    { kind: "box", x: 0.2, y: 0.9, w: 0.6, h: 0.05 },
  ],
  short_form: [
    { kind: "xbox", x: 0.08, y: 0.13, w: 0.72, h: 0.52 },
    { kind: "bar", x: 0.1, y: 0.7, w: 0.62, h: 0.045, strong: true },
    { kind: "bar", x: 0.1, y: 0.76, w: 0.44, h: 0.03 },
    { kind: "circle", cx: 0.9, cy: 0.52, r: 0.05 },
    { kind: "circle", cx: 0.9, cy: 0.62, r: 0.05 },
    { kind: "circle", cx: 0.9, cy: 0.72, r: 0.05 },
  ],
  video_edit: [
    { kind: "xbox", x: 0.06, y: 0.08, w: 0.88, h: 0.84 },
    { kind: "bar", x: 0.09, y: 0.68, w: 0.42, h: 0.1, strong: true },
    { kind: "bar", x: 0.09, y: 0.8, w: 0.26, h: 0.05 },
  ],
  logo: [
    { kind: "circle", cx: 0.5, cy: 0.4, r: 0.2, fill: true },
    { kind: "bar", x: 0.22, y: 0.7, w: 0.56, h: 0.1, strong: true },
    { kind: "bar", x: 0.34, y: 0.84, w: 0.32, h: 0.04 },
  ],
  bundle: [
    { kind: "xbox", x: 0.06, y: 0.08, w: 0.56, h: 0.42 },
    { kind: "bar", x: 0.09, y: 0.36, w: 0.3, h: 0.08, strong: true },
    { kind: "xbox", x: 0.7, y: 0.08, w: 0.24, h: 0.84 },
    { kind: "box", x: 0.06, y: 0.58, w: 0.56, h: 0.1 },
    { kind: "box", x: 0.06, y: 0.7, w: 0.56, h: 0.1 },
    { kind: "box", x: 0.06, y: 0.82, w: 0.56, h: 0.1 },
  ],
};

export const GUIDES: Record<FrameGuide, Guide[]> = {
  "title-safe": [
    { kind: "rect", x: 0.05, y: 0.05, w: 0.9, h: 0.9 },
    { kind: "line", x1: 0.5, y1: 0.46, x2: 0.5, y2: 0.54 },
    { kind: "line", x1: 0.48, y1: 0.5, x2: 0.52, y2: 0.5 },
  ],
  "shorts-safe": [
    { kind: "line", x1: 0, y1: 0.1, x2: 1, y2: 0.1 },
    { kind: "line", x1: 0, y1: 0.84, x2: 1, y2: 0.84 },
    { kind: "line", x1: 0.84, y1: 0.1, x2: 0.84, y2: 0.84 },
  ],
  center: [
    { kind: "line", x1: 0.5, y1: 0.04, x2: 0.5, y2: 0.96 },
    { kind: "line", x1: 0.04, y1: 0.4, x2: 0.96, y2: 0.4 },
    { kind: "circle", cx: 0.5, cy: 0.4, r: 0.3 },
  ],
  sections: [0.19, 0.44, 0.555, 0.645, 0.845].map((y) => ({ kind: "line" as const, x1: 0.03, y1: y, x2: 0.97, y2: y })),
  banner: [
    { kind: "line", x1: 0.54, y1: 0.06, x2: 0.54, y2: 0.94 },
    { kind: "rect", x: 0.03, y: 0.08, w: 0.94, h: 0.84 },
  ],
  set: [{ kind: "line", x1: 0.66, y1: 0.04, x2: 0.66, y2: 0.96 }],
};

/** Where a rough's headline is set, per type (replaces the strong copy bars). */
export const HEADLINE_ZONE: Record<OrderType, Zone & { size: number }> = {
  thumbnail: { x: 0.06, y: 0.18, w: 0.46, h: 0.64, size: 7.6 },
  banner: { x: 0.05, y: 0.16, w: 0.47, h: 0.5, size: 6.4 },
  detail_page: { x: 0.1, y: 0.192, w: 0.8, h: 0.06, size: 8.5 },
  short_form: { x: 0.08, y: 0.66, w: 0.74, h: 0.16, size: 9.5 },
  video_edit: { x: 0.08, y: 0.56, w: 0.56, h: 0.26, size: 5.6 },
  logo: { x: 0.08, y: 0.64, w: 0.84, h: 0.2, size: 11 },
  bundle: { x: 0.08, y: 0.2, w: 0.5, h: 0.28, size: 5.4 },
};

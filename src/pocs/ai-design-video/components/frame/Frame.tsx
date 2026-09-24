import type { CSSProperties } from "react";
import { ORDER_TYPE_INFO, type FrameMedium, type OrderType } from "../../domain/catalog";
import { GUIDES, HEADLINE_ZONE, ROUGH, type Guide, type Shape } from "./geometry";
import styles from "./frame.module.css";

export interface FrameProps {
  type: OrderType;
  medium: FrameMedium;
  /** Rendered height in px. Omit for a fluid frame that fills its container's width. */
  height?: number;
  /** Caps a fixed frame's width (wide formats in narrow columns). */
  maxWidth?: number;
  /** Copy set inside the frame as the rough's headline. */
  headline?: string;
  /** A finished piece's colours: [shape, ground, type]. Drawn without guides. */
  palette?: readonly string[];
  /** Plays the inking draw on mount. */
  inking?: boolean;
  /** Accessible name; frames without one are decorative. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

const FLUID_WIDTH = 320;

/** A deliverable drawn as a storyboard frame at its true aspect ratio, in the medium of its stage. */
export function Frame({
  type,
  medium,
  height,
  maxWidth,
  headline,
  palette,
  inking,
  label,
  className,
  style,
}: FrameProps) {
  const [rw, rh] = ORDER_TYPE_INFO[type].frame.ratio;
  const fluid = height === undefined;
  let w = fluid ? FLUID_WIDTH : (height * rw) / rh;
  let h = fluid ? (FLUID_WIDTH * rh) / rw : height;
  if (!fluid && maxWidth && w > maxWidth) {
    h = (maxWidth * rh) / rw;
    w = maxWidth;
  }
  const finished = palette !== undefined && palette.length >= 2;
  const [shapeColor, groundColor, typeColor] = finished
    ? [palette[0], palette[1], palette[2] ?? palette[0]]
    : [undefined, undefined, undefined];
  const zone = HEADLINE_ZONE[type];
  // Copy set below ~9px reads as noise; tiny frames keep the plain copy bars instead.
  const lettered = Boolean(headline) && (fluid || w >= 88);
  // Set copy replaces the copy bars it would sit on.
  const underZone = (s: Shape) =>
    s.kind === "bar" && s.x < zone.x + zone.w && s.x + s.w > zone.x && s.y < zone.y + zone.h && s.y + s.h > zone.y;
  const shapes = ROUGH[type].filter((s) => !(lettered && s.kind === "bar" && (s.strong || underZone(s))));
  const inset = medium === "ink" || finished ? 1.25 : 1;
  // Stamps need room; thumbnails in lists carry their stage in the text beside them.
  const stamped = fluid || h >= 56;

  return (
    <div
      className={[styles.frame, fluid ? styles.fluid : "", inking ? styles.inking : "", className ?? ""].join(" ")}
      data-medium={finished ? "finished" : medium}
      style={{ aspectRatio: `${rw} / ${rh}`, width: fluid ? undefined : w, ...style }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {finished && <rect x={0} y={0} width={w} height={h} fill={groundColor} />}
        {!finished && (
          <g className={styles.guides}>
            {GUIDES[ORDER_TYPE_INFO[type].frame.guide].map((guide, i) => (
              <GuideMark key={i} guide={guide} w={w} h={h} />
            ))}
          </g>
        )}
        <g className={styles.rough} style={finished ? ({ "--shape": shapeColor } as CSSProperties) : undefined}>
          {shapes.map((shape, i) => (
            <ShapeMark key={i} shape={shape} w={w} h={h} />
          ))}
        </g>
        <rect
          className={styles.outline}
          x={inset}
          y={inset}
          width={Math.max(w - inset * 2, 0)}
          height={Math.max(h - inset * 2, 0)}
          pathLength={1}
        />
      </svg>
      {lettered && (
        <span
          className={styles.headline}
          style={{
            left: `${zone.x * 100}%`,
            top: `${zone.y * 100}%`,
            width: `${zone.w * 100}%`,
            height: `${zone.h * 100}%`,
            fontSize: `max(9px, ${zone.size}cqw)`,
            color: typeColor,
          }}
        >
          {headline}
        </span>
      )}
      {stamped && medium === "ink" && !finished && <span className={styles.ok}>OK</span>}
      {stamped && medium === "redline" && (
        <svg className={styles.correction} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M3 15c3-7 5-7 6-2s3 5 5-1 4-6 7-3" />
        </svg>
      )}
    </div>
  );
}

function GuideMark({ guide, w, h }: { guide: Guide; w: number; h: number }) {
  switch (guide.kind) {
    case "line":
      return <line x1={guide.x1 * w} y1={guide.y1 * h} x2={guide.x2 * w} y2={guide.y2 * h} />;
    case "rect":
      return <rect x={guide.x * w} y={guide.y * h} width={guide.w * w} height={guide.h * h} />;
    case "circle":
      return <circle cx={guide.cx * w} cy={guide.cy * h} r={guide.r * Math.min(w, h)} />;
  }
}

function ShapeMark({ shape, w, h }: { shape: Shape; w: number; h: number }) {
  switch (shape.kind) {
    case "xbox": {
      const x = shape.x * w;
      const y = shape.y * h;
      const bw = shape.w * w;
      const bh = shape.h * h;
      return (
        <g className={styles.xbox}>
          <rect x={x} y={y} width={bw} height={bh} />
          <path d={`M${x} ${y}L${x + bw} ${y + bh}M${x + bw} ${y}L${x} ${y + bh}`} />
        </g>
      );
    }
    case "bar":
      return (
        <rect
          className={shape.strong ? styles.barStrong : styles.bar}
          x={shape.x * w}
          y={shape.y * h}
          width={shape.w * w}
          height={shape.h * h}
        />
      );
    case "box":
      return <rect className={styles.box} x={shape.x * w} y={shape.y * h} width={shape.w * w} height={shape.h * h} />;
    case "circle":
      return (
        <circle
          className={shape.fill ? styles.dotStrong : styles.dot}
          cx={shape.cx * w}
          cy={shape.cy * h}
          r={shape.r * Math.min(w, h)}
        />
      );
  }
}

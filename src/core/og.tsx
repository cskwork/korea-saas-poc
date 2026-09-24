import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/**
 * Shared Open Graph card renderer (1200×630, generated at build time).
 * Pretendard ships static OTFs in node_modules, so Korean text renders without network access.
 */
const BRAND = "한국형 1인 SaaS 10선";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const fontFile = (weight: "Bold" | "ExtraBold") =>
  readFile(path.join(process.cwd(), `node_modules/pretendard/dist/public/static/Pretendard-${weight}.otf`));

export interface OgCard {
  /** Big line, e.g. the product name. */
  title: string;
  /** One line under it, e.g. the tagline. */
  subtitle: string;
  /** Small caption at the bottom, e.g. the business model. */
  caption?: string;
  /** Field colour (hex). */
  paint: string;
  /** Text colour on the field (hex). */
  ink: string;
}

export async function renderOgImage({ title, subtitle, caption, paint, ink }: OgCard) {
  const [bold, extraBold] = await Promise.all([fontFile("Bold"), fontFile("ExtraBold")]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: paint,
          color: ink,
          fontFamily: "Pretendard",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}>{title}</div>
          <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.35, maxWidth: 980, opacity: 0.92 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 700, opacity: 0.85 }}>
          <span>{caption ?? ""}</span>
          <span>{title === BRAND ? "" : BRAND}</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Pretendard", data: bold, weight: 700, style: "normal" },
        { name: "Pretendard", data: extraBold, weight: 800, style: "normal" },
      ],
    },
  );
}

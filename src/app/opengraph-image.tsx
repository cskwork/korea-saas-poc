import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/core/og";

export const alt = "한국형 1인 SaaS 10선 — 실제로 돌아가는 열 개의 가게";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    title: "한국형 1인 SaaS 10선",
    subtitle: "혼자 운영할 수 있는 열 가지 사업을, 실제로 돌아가는 제품으로.",
    caption: "간판을 눌러 들어가 직접 써 보세요",
    paint: "#0d5a44",
    ink: "#ffffff",
  });
}

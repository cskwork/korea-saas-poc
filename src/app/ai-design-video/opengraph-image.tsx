import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/core/og";
import { meta } from "@/pocs/ai-design-video/meta";

export const alt = `${meta.name} — ${meta.tagline}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    title: meta.name,
    subtitle: meta.tagline,
    caption: meta.category,
    paint: "#fbfdfe",
    ink: "#191d24",
  });
}

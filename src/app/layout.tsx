import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { siteUrl } from "@/core/env";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "한국형 1인 SaaS 10선",
    template: "%s",
  },
  description: "AI 시대 1인 창업을 위한 10가지 한국형 SaaS 비즈니스 모델을, 실제로 동작하는 제품으로 만들었습니다.",
  applicationName: "한국형 1인 SaaS 10선",
  openGraph: { type: "website", locale: "ko_KR", siteName: "한국형 1인 SaaS 10선" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

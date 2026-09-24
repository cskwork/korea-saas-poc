import { after, type NextRequest } from "next/server";
import { notice, resolveRedirect } from "@/pocs/affiliate-marketing/server/redirect";

/** Tracked short link: records the click (after responding) and 302-redirects to the affiliate URL. */

const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const outcome = await resolveRedirect({
    code,
    channelTag: request.nextUrl.searchParams.get("c"),
    referrer: request.headers.get("referer"),
    userAgent: request.headers.get("user-agent"),
    ownHost: request.nextUrl.hostname,
  });

  switch (outcome.kind) {
    case "redirect":
      if (outcome.record) after(outcome.record);
      return new Response(null, { status: 302, headers: { ...HEADERS, Location: outcome.location } });
    case "ended":
      return html(410, notice("판매가 끝난 링크예요", `'${outcome.productName}' 링크는 게시자가 판매를 종료했어요. 게시글의 다른 링크를 확인해 주세요.`));
    case "missing":
      return html(404, notice("없는 링크예요", "주소가 잘못되었거나 게시자가 링크를 삭제했어요."));
    case "unavailable":
      return html(503, notice("잠시 후 다시 시도해 주세요", "링크를 확인하는 중에 문제가 생겼어요. 잠시 후 다시 눌러 주세요."));
  }
}

function html(status: number, body: string) {
  return new Response(body, { status, headers: { ...HEADERS, "Content-Type": "text/html; charset=utf-8" } });
}

import type { NextRequest } from "next/server";
import { seoulDateKey } from "@/core/format";
import { subscribersToCsv } from "@/pocs/newsletter-community/domain/csv";
import { getSubscribersForExport } from "@/pocs/newsletter-community/server/queries";
import { subscriberListQuery } from "@/pocs/newsletter-community/server/schemas";

/** Downloads the list (with the page's current filters) as a UTF-8 CSV that Excel opens in Korean. */
export async function GET(request: NextRequest) {
  const { page: _page, ...filter } = subscriberListQuery.parse(Object.fromEntries(request.nextUrl.searchParams));
  const rows = await getSubscribersForExport(filter);
  const day = seoulDateKey();
  return new Response(subscribersToCsv(rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="subscribers-${day}.csv"; filename*=UTF-8''${encodeURIComponent(`구독자-명부-${day}.csv`)}`,
      "cache-control": "no-store",
    },
  });
}

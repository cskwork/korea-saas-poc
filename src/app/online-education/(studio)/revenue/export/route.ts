import { monthKey } from "@/pocs/online-education/domain/calendar";
import { revenueCsv } from "@/pocs/online-education/domain/revenue";
import { getRevenue } from "@/pocs/online-education/server/queries";

/** Monthly revenue as a CSV download for the visitor's workspace. */
export async function GET(request: Request) {
  const months = new URL(request.url).searchParams.get("months") ?? "12";
  const report = await getRevenue({ months });
  const filename = `edumarket-revenue-${monthKey(new Date())}.csv`;
  return new Response(revenueCsv(report.series), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

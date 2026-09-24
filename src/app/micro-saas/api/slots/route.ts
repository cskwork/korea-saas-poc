import { z } from "zod";
import { dateSchema } from "@/pocs/micro-saas/domain/validation";
import { getSlots } from "@/pocs/micro-saas/server/queries";

const query = z.object({
  date: dateSchema,
  serviceId: z.uuid(),
  exclude: z.uuid().optional(),
});

/** Slot occupancy for the owner's new-booking slip: GET ?date=YYYY-MM-DD&serviceId=…[&exclude=bookingId] */
export async function GET(request: Request) {
  const parsed = query.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  const slots = await getSlots({ date: parsed.data.date, serviceId: parsed.data.serviceId, excludeId: parsed.data.exclude });
  if (!slots) return Response.json({ error: "서비스를 찾을 수 없어요." }, { status: 404 });
  return Response.json(slots, { headers: { "Cache-Control": "no-store" } });
}

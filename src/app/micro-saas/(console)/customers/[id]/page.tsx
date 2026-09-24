import type { Metadata } from "next";
import { CustomersView } from "@/pocs/micro-saas/components/customers/CustomersView";
import { getCustomerDetail, getCustomers } from "@/pocs/micro-saas/server/queries";
import { readListParams } from "../params";

export const metadata: Metadata = {
  title: "고객 상세",
  description: "고객 한 명의 방문 기록, 누적 이용 금액, 다음 예약과 메모.",
  robots: { index: false },
};

export default async function CustomerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, list] = await Promise.all([params, searchParams]);
  const { query, sort } = readListParams(list);
  const detail = await getCustomerDetail(id);
  return <CustomersView list={await getCustomers({ query, sort })} query={query} sort={sort} detail={detail} />;
}

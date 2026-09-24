import type { Metadata } from "next";
import { CustomersView } from "@/pocs/micro-saas/components/customers/CustomersView";
import { getCustomers } from "@/pocs/micro-saas/server/queries";
import { readListParams } from "./params";

export const metadata: Metadata = {
  title: "고객 관리",
  description: "이름이나 연락처로 고객을 찾고, 방문 횟수와 기록, 메모를 한곳에서 봐요.",
};

export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { query, sort } = readListParams(await searchParams);
  return <CustomersView list={await getCustomers({ query, sort })} query={query} sort={sort} />;
}

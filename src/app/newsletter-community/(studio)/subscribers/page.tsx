import type { Metadata } from "next";
import { formatNumber } from "@/core/format";
import { PageHeader } from "@/pocs/newsletter-community/components/shell/PageHeader";
import { SubscriberFilters } from "@/pocs/newsletter-community/components/subscribers/SubscriberFilters";
import { SubscriberTable } from "@/pocs/newsletter-community/components/subscribers/SubscriberTable";
import { SubscriberTools } from "@/pocs/newsletter-community/components/subscribers/SubscriberTools";
import { getSubscribersPage } from "@/pocs/newsletter-community/server/queries";
import { subscriberListQuery } from "@/pocs/newsletter-community/server/schemas";
import { SUBSCRIBER_PAGE_SIZE } from "@/pocs/newsletter-community/server/store/subscribers";

export const metadata: Metadata = {
  title: "구독자 명부",
  description: "구독자를 등급·상태로 찾고, 올리고, 고치고, CSV로 가져오거나 내보냅니다.",
};

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { page, ...filter } = subscriberListQuery.parse(await searchParams);
  const { rows, total, counts } = await getSubscribersPage(filter, page);

  const query = (extra: Record<string, string>) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...filter, ...extra })) if (value) params.set(key, String(value));
    return params.toString();
  };

  return (
    <>
      <PageHeader
        title="구독자 명부"
        lead={`구독 중 ${formatNumber(counts.active)}명 · 무료 ${formatNumber(counts.byTier.free)} · 베이직 ${formatNumber(
          counts.byTier.basic,
        )} · 프로 ${formatNumber(counts.byTier.pro)} · 해지 ${formatNumber(counts.unsubscribed)}`}
      />
      <SubscriberTools exportHref={`/newsletter-community/subscribers/export?${query({})}`} />
      <SubscriberFilters filter={filter} />
      <SubscriberTable
        rows={rows}
        total={total}
        page={page}
        pageSize={SUBSCRIBER_PAGE_SIZE}
        pageHref={(next) => `/newsletter-community/subscribers?${query({ page: String(next) })}`}
        filtered={Boolean(filter.q || filter.tier || filter.status)}
      />
    </>
  );
}

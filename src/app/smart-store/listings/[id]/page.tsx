import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ListingDetail } from "@/pocs/smart-store/components/listings/ListingDetail";
import { getCopywriterStatus, getListingDetail } from "@/pocs/smart-store/server/queries";
import { param, type SearchParams } from "@/pocs/smart-store/server/search-params";

// "AI로 다시 쓰기" may call Claude.
export const maxDuration = 60;

type Props = { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> };

async function load(params: Props["params"]) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const listing = await getListingDetail(id);
  if (!listing) notFound();
  return listing;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await load(params);
  return { title: listing.title, description: `${listing.title}의 판매가, 남는 돈, 상품명·상세설명을 관리합니다.` };
}

export default async function Page({ params, searchParams }: Props) {
  const [listing, query] = await Promise.all([load(params), searchParams]);
  const created = param(query, "created");
  return (
    <ListingDetail
      listing={listing}
      created={created === "claude" || created === "template" ? created : null}
      fellBack={param(query, "notice") === "1"}
      writer={getCopywriterStatus()}
    />
  );
}

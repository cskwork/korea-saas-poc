import type { Metadata } from "next";
import { EstimateView } from "@/pocs/dev-freelancing/components/documents/DocumentViews";
import { getEstimate } from "@/pocs/dev-freelancing/server/queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { estimate } = await getEstimate((await params).id);
  return { title: `견적서 ${estimate.number}`, description: `${estimate.title} 견적서` };
}

export default async function EstimatePage({ params }: Props) {
  const data = await getEstimate((await params).id);
  return <EstimateView estimate={data.estimate} profile={data.profile} invoices={data.invoices} today={data.today} />;
}

import type { Metadata } from "next";
import { InvoiceView } from "@/pocs/dev-freelancing/components/documents/DocumentViews";
import { getInvoice } from "@/pocs/dev-freelancing/server/queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { invoice } = await getInvoice((await params).id);
  return { title: `인보이스 ${invoice.number}`, description: `${invoice.title} 인보이스` };
}

export default async function InvoicePage({ params }: Props) {
  const data = await getInvoice((await params).id);
  return <InvoiceView invoice={data.invoice} profile={data.profile} estimate={data.estimate} today={data.today} />;
}

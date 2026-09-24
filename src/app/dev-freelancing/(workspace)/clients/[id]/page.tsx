import type { Metadata } from "next";
import { ClientDetail } from "@/pocs/dev-freelancing/components/clients/ClientDetail";
import { getClient } from "@/pocs/dev-freelancing/server/queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { client } = await getClient((await params).id);
  return { title: client.company ? `${client.name} · ${client.company}` : client.name, description: "고객 정보, 거래 이력, 연락 기록." };
}

export default async function ClientPage({ params }: Props) {
  const data = await getClient((await params).id);
  return <ClientDetail data={data} today={data.today} />;
}

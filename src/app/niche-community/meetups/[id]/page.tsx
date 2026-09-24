import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatMonthDay, formatTime } from "@/core/format";
import { MeetupPage } from "@/pocs/niche-community/components/MeetupPage";
import { getMeetupPage } from "@/pocs/niche-community/server/queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getMeetupPage((await params).id);
  if (!data) notFound();
  const { meetup } = data;
  return {
    title: meetup.title,
    description: `${formatMonthDay(meetup.startsAt)} ${formatTime(meetup.startsAt)} · ${meetup.location} · 정원 ${meetup.capacity}명`,
  };
}

export default async function NicheCommunityMeetupPage({ params }: Props) {
  const data = await getMeetupPage((await params).id);
  if (!data) notFound();
  return <MeetupPage data={data} />;
}

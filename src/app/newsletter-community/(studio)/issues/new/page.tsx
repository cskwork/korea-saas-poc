import type { Metadata } from "next";
import { seoulDateKey } from "@/core/format";
import { IssueEditor } from "@/pocs/newsletter-community/components/issues/IssueEditor";
import { addDays } from "@/pocs/newsletter-community/domain/dates";
import { getNewIssueContext } from "@/pocs/newsletter-community/server/queries";

export const metadata: Metadata = {
  title: "새 호 쓰기",
  description: "새 호의 원고를 쓰고, 받는 사람과 광고 지면을 정해 저장·예약·발행합니다.",
};

export default async function NewIssuePage() {
  const { recipients, sponsorOptions, publication, nextNumber } = await getNewIssueContext();
  return (
    <IssueEditor
      issue={null}
      recipients={recipients}
      sponsorOptions={sponsorOptions}
      nextNumber={nextNumber}
      defaultSchedule={{ date: addDays(seoulDateKey(), 1), time: `${String(publication.sendHour).padStart(2, "0")}:00` }}
      initialView="write"
    />
  );
}

import type { Metadata } from "next";
import { seoulDateKey } from "@/core/format";
import { IssueEditor } from "@/pocs/newsletter-community/components/issues/IssueEditor";
import { SendReport } from "@/pocs/newsletter-community/components/issues/SendReport";
import { addDays, seoulParts } from "@/pocs/newsletter-community/domain/dates";
import { getIssueForEditor } from "@/pocs/newsletter-community/server/queries";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { issue } = await getIssueForEditor((await params).id);
  return {
    title: issue.number ? `제${issue.number}호 ${issue.title}` : `초안: ${issue.title}`,
    description: issue.lede || "호의 원고, 발행 설정, 발송 기록을 봅니다.",
  };
}

export default async function IssuePage({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { issue, recipients, sponsorOptions, publication, report, nextNumber } = await getIssueForEditor(id);
  const schedule = issue.scheduledAt
    ? seoulParts(issue.scheduledAt)
    : { date: addDays(seoulDateKey(), 1), time: `${String(publication.sendHour).padStart(2, "0")}:00` };
  return (
    <>
      <IssueEditor
        issue={{
          id: issue.id,
          number: issue.number,
          title: issue.title,
          lede: issue.lede,
          body: issue.body,
          category: issue.category,
          audience: issue.audience,
          status: issue.status,
          scheduledAt: issue.scheduledAt,
          publishedAt: issue.publishedAt,
        }}
        recipients={recipients}
        sponsorOptions={sponsorOptions}
        nextNumber={nextNumber}
        defaultSchedule={schedule}
        initialView={query.view === "proof" ? "proof" : "write"}
        done={typeof query.done === "string" ? query.done : undefined}
      />
      {report && issue.number && issue.publishedAt && (
        <SendReport report={report} number={issue.number} publishedAt={issue.publishedAt} />
      )}
    </>
  );
}

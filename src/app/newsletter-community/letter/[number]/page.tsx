import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IssueReader } from "@/pocs/newsletter-community/components/letter/IssueReader";
import { getLetterIssue } from "@/pocs/newsletter-community/server/queries";
import { issueNumberParam } from "@/pocs/newsletter-community/server/schemas";

type Props = { params: Promise<{ number: string }> };

async function load(params: Props["params"]) {
  const parsed = issueNumberParam.safeParse((await params).number);
  if (!parsed.success) notFound();
  return getLetterIssue(parsed.data);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { issue } = await load(params);
  return {
    title: `제${issue.number}호 ${issue.title}`,
    description: issue.lede || undefined,
    openGraph: { type: "article", title: issue.title, description: issue.lede || undefined },
  };
}

export default async function LetterIssuePage({ params }: Props) {
  const data = await load(params);
  return <IssueReader {...data} />;
}

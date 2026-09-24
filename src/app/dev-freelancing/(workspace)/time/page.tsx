import type { Metadata } from "next";
import { z } from "zod";
import { TimeView } from "@/pocs/dev-freelancing/components/time/TimeView";
import { isDateKey } from "@/pocs/dev-freelancing/domain/dates";
import { getTimePage } from "@/pocs/dev-freelancing/server/queries";

export const metadata: Metadata = {
  title: "시간 기록",
  description: "52주 작업 기록, 타이머와 직접 입력한 시간, 프로젝트별 예상 대비 추적 시간.",
};

type Search = { project?: string; day?: string; range?: string };

export default async function TimePage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const projectId = z.uuid().safeParse(params.project).success ? params.project! : "";
  const day = params.day && isDateKey(params.day) ? params.day : "";
  const range = params.range === "month" || params.range === "all" ? params.range : "week";
  const data = await getTimePage({ projectId: projectId || undefined, day: day || undefined, range });
  return <TimeView {...data} filter={{ projectId, day, range }} />;
}

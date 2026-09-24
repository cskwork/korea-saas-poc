import type { Metadata } from "next";
import { CourseList } from "@/pocs/online-education/components/courses/CourseList";
import { getCourses } from "@/pocs/online-education/server/queries";

export const metadata: Metadata = {
  title: "강의",
  description: "강의를 만들고, 커리큘럼을 편집하고, 게시 상태와 판매 현황을 관리해요.",
};

type Params = Record<string, string | string[] | undefined>;

export default async function CoursesPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const { all, rows, filters } = await getCourses(params);
  const deleted = typeof params.deleted === "string" ? params.deleted : undefined;
  return <CourseList all={all} rows={rows} filters={filters} deleted={deleted} />;
}

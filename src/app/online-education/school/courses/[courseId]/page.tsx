import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseLanding } from "@/pocs/online-education/components/school/CourseLanding";
import { dayKey } from "@/pocs/online-education/domain/calendar";
import { getCourse, getSchool } from "@/pocs/online-education/server/queries";

type Props = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = await getCourse((await params).courseId);
  if (!detail) return { title: "강의를 찾을 수 없어요" };
  return {
    title: detail.course.title,
    description: detail.course.description,
    openGraph: { title: detail.course.title, description: detail.course.description },
    ...(detail.course.status === "draft" ? { robots: { index: false } } : {}),
  };
}

export default async function SchoolCoursePage({ params, searchParams }: Props) {
  const [{ courseId }, query] = await Promise.all([params, searchParams]);
  const preview = query.preview === "1";
  const [detail, school] = await Promise.all([getCourse(courseId), getSchool()]);
  if (!detail || (detail.course.status === "draft" && !preview)) notFound();
  return <CourseLanding detail={detail} school={school} today={dayKey(new Date())} preview={preview} />;
}

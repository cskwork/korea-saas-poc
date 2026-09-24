import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { aiStatus } from "@/core/ai";
import { CoursePage } from "@/pocs/online-education/components/builder/CoursePage";
import { getCourse } from "@/pocs/online-education/server/queries";

/** The builder can draft a curriculum with Claude (server action on this page). */
export const maxDuration = 60;

type Props = { params: Promise<{ courseId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = await getCourse((await params).courseId);
  return detail
    ? { title: `커리큘럼 편집 — ${detail.course.title}`, description: `${detail.course.title}의 섹션과 레슨을 편집해요.` }
    : { title: "강의를 찾을 수 없어요" };
}

export default async function CourseBuilderPage({ params }: Props) {
  const detail = await getCourse((await params).courseId);
  if (!detail) notFound();
  return <CoursePage detail={detail} aiEnabled={aiStatus().enabled} />;
}

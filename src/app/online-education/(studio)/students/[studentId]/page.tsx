import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudentDetail } from "@/pocs/online-education/components/students/StudentDetail";
import { getStudent } from "@/pocs/online-education/server/queries";

type Props = { params: Promise<{ studentId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = await getStudent((await params).studentId);
  return { title: detail ? `${detail.learner.name} 수강생` : "수강생을 찾을 수 없어요" };
}

export default async function StudentPage({ params }: Props) {
  const detail = await getStudent((await params).studentId);
  if (!detail) notFound();
  return <StudentDetail detail={detail} now={new Date()} />;
}

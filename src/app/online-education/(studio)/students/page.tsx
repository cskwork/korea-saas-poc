import type { Metadata } from "next";
import { StudentList } from "@/pocs/online-education/components/students/StudentList";
import { getStudents } from "@/pocs/online-education/server/queries";

export const metadata: Metadata = {
  title: "수강생",
  description: "수강생의 강의별 진도와 학습 계획, 결제액을 확인하고 뒤처진 수강생을 찾아요.",
};

type Params = Record<string, string | string[] | undefined>;

export default async function StudentsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const data = await getStudents(params);
  return <StudentList data={data} deleted={typeof params.deleted === "string" ? params.deleted : undefined} />;
}

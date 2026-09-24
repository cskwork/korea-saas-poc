import type { Metadata } from "next";
import { NewCourse } from "@/pocs/online-education/components/courses/NewCourse";
import { getCourses } from "@/pocs/online-education/server/queries";

export const metadata: Metadata = {
  title: "새 강의 만들기",
  description: "제목, 소개, 가격을 정해 새 강의 초안을 만들어요.",
};

export default async function NewCoursePage() {
  const { all } = await getCourses({});
  return <NewCourse usedColors={all.map((course) => course.color)} />;
}

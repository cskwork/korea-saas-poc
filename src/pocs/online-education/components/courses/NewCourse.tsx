import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { CourseColor } from "../../db/schema";
import { nextCourseColor } from "../../domain/catalog";
import ui from "../ui/ui.module.css";
import { CourseForm } from "./CourseForm";
import styles from "./courses.module.css";

export function NewCourse({ usedColors }: { usedColors: CourseColor[] }) {
  return (
    <>
      <Link href="/online-education/courses" className={ui.back}>
        <ArrowLeft size={15} aria-hidden />
        강의 목록
      </Link>
      <header className={ui.pageHeader}>
        <div>
          <h1 className={ui.pageTitle}>새 강의 만들기</h1>
          <p className={ui.pageLede}>먼저 스쿨에 보일 정보를 정해요. 커리큘럼은 다음 화면에서 쌓아요.</p>
        </div>
      </header>
      <div className={styles.formPage}>
        <CourseForm
          defaults={{
            title: "",
            description: "",
            category: "programming",
            color: nextCourseColor(usedColors),
            listPrice: 0,
            price: 0,
            outcomes: [],
          }}
        />
        <aside className={styles.formAside}>
          <h2>강의가 팔리기까지</h2>
          <ol>
            <li>초안으로 만들어요. 스쿨에는 아직 보이지 않아요.</li>
            <li>섹션과 레슨을 추가해요. 레슨 길이만큼 블록이 길어져요.</li>
            <li>첫 레슨 몇 개를 무료 미리보기로 열어 두세요.</li>
            <li>게시하면 스쿨 페이지에서 수강 신청을 받아요.</li>
          </ol>
        </aside>
      </div>
    </>
  );
}

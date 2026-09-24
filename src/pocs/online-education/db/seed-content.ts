import type { CourseCategory, CourseColor, LessonType, ProductType } from "./schema";

/**
 * Sample catalogue for a new workspace: the legacy POC's courses and products,
 * expanded into complete curricula. Everything here is demo data.
 */

export interface SeedLesson {
  title: string;
  type: LessonType;
  duration: string;
  preview?: boolean;
}

export interface SeedCourse {
  title: string;
  description: string;
  category: CourseCategory;
  color: CourseColor;
  listPrice: number;
  price: number;
  published: boolean;
  /** Months before the current one when sales started (null: never sold, e.g. a draft). */
  launchedMonthsAgo: number | null;
  /** Share of course sales once launched. */
  weight: number;
  createdDaysAgo: number;
  outcomes: string[];
  sections: { title: string; lessons: SeedLesson[] }[];
}

export const SEED_SCHOOL = { name: "김선생의 실무 코딩 교실", creatorName: "김선생" };

export const SEED_COURSES: SeedCourse[] = [
  {
    title: "실전 React 완전 정복",
    description:
      "처음 React를 배우는 분부터 실무에 바로 써야 하는 분까지. Hooks, Context, 성능 최적화를 투두 앱 하나를 끝까지 만들면서 익혀요.",
    category: "programming",
    color: "sky",
    listPrice: 129_000,
    price: 89_000,
    published: true,
    launchedMonthsAgo: 11,
    weight: 0.5,
    createdDaysAgo: 372,
    outcomes: [
      "useState와 useEffect로 상태와 부수 효과를 다루는 법",
      "Context와 커스텀 훅으로 컴포넌트 구조를 잡는 법",
      "투두 앱을 처음부터 끝까지 직접 만들어 보는 경험",
      "느린 화면을 찾아서 렌더링을 최적화하는 법",
    ],
    sections: [
      {
        title: "React 기초",
        lessons: [
          { title: "React란 무엇인가?", type: "video", duration: "12:30", preview: true },
          { title: "JSX 문법 이해하기", type: "video", duration: "15:45", preview: true },
          { title: "컴포넌트와 Props", type: "video", duration: "18:20" },
        ],
      },
      {
        title: "State와 생명주기",
        lessons: [
          { title: "useState 훅", type: "video", duration: "20:15" },
          { title: "useEffect 훅", type: "video", duration: "22:40" },
          { title: "실습: 투두 앱 만들기", type: "video", duration: "35:00" },
        ],
      },
      {
        title: "고급 패턴",
        lessons: [
          { title: "Context API", type: "video", duration: "25:10" },
          { title: "Custom Hooks", type: "video", duration: "18:55" },
          { title: "성능 최적화", type: "video", duration: "30:20" },
          { title: "최종 퀴즈", type: "quiz", duration: "10:00" },
        ],
      },
    ],
  },
  {
    title: "피그마 UI/UX 디자인 마스터",
    description:
      "피그마로 실무 UI를 만드는 과정을 처음부터 따라가요. Auto Layout, 컴포넌트, 디자인 시스템을 거쳐 포트폴리오용 화면 한 벌을 완성해요.",
    category: "design",
    color: "pink",
    listPrice: 89_000,
    price: 69_000,
    published: true,
    launchedMonthsAgo: 9,
    weight: 0.3,
    createdDaysAgo: 300,
    outcomes: [
      "Auto Layout으로 늘었다 줄었다 하는 화면 만들기",
      "변형(Variant)까지 갖춘 컴포넌트 설계",
      "작은 팀이 함께 쓰는 디자인 시스템 정리법",
      "프로토타입을 만들어 개발자에게 넘기는 법",
    ],
    sections: [
      {
        title: "피그마 기초",
        lessons: [
          { title: "피그마 소개 및 설치", type: "video", duration: "08:15", preview: true },
          { title: "기본 도구 사용법", type: "video", duration: "14:30", preview: true },
        ],
      },
      {
        title: "실무 디자인",
        lessons: [
          { title: "Auto Layout 마스터", type: "video", duration: "25:00" },
          { title: "컴포넌트 시스템", type: "video", duration: "30:45" },
          { title: "디자인 시스템 구축", type: "text", duration: "45:20" },
        ],
      },
      {
        title: "포트폴리오 완성",
        lessons: [
          { title: "앱 화면 리디자인 실습", type: "video", duration: "38:00" },
          { title: "프로토타입 공유하기", type: "video", duration: "12:10" },
          { title: "마무리 퀴즈", type: "quiz", duration: "08:00" },
        ],
      },
    ],
  },
  {
    title: "Next.js로 만드는 나만의 강의 사이트",
    description:
      "강의를 팔 수 있는 내 사이트를 Next.js로 직접 만들어요. 페이지 구성부터 수강 신청 흐름, 배포까지 한 번에 따라갈 수 있어요.",
    category: "programming",
    color: "tangerine",
    listPrice: 99_000,
    price: 79_000,
    published: true,
    launchedMonthsAgo: 3,
    weight: 0.2,
    createdDaysAgo: 118,
    outcomes: [
      "App Router로 페이지와 레이아웃을 나누는 법",
      "서버 컴포넌트에서 데이터를 읽고 폼을 처리하는 법",
      "수강 신청과 결제 기록 흐름 설계",
      "Vercel에 배포하고 운영하는 체크리스트",
    ],
    sections: [
      {
        title: "시작하기",
        lessons: [
          { title: "완성본 둘러보기", type: "video", duration: "06:40", preview: true },
          { title: "프로젝트 만들기와 폴더 구조", type: "video", duration: "14:20" },
        ],
      },
      {
        title: "페이지와 데이터",
        lessons: [
          { title: "App Router로 페이지 나누기", type: "video", duration: "21:30" },
          { title: "서버 컴포넌트에서 데이터 읽기", type: "video", duration: "24:10" },
          { title: "폼과 서버 액션", type: "video", duration: "26:45" },
        ],
      },
      {
        title: "결제와 배포",
        lessons: [
          { title: "수강 신청 흐름 만들기", type: "video", duration: "28:30" },
          { title: "Vercel에 배포하기", type: "video", duration: "16:05" },
          { title: "운영 체크리스트", type: "text", duration: "11:20" },
          { title: "배운 내용 점검 퀴즈", type: "quiz", duration: "09:00" },
        ],
      },
    ],
  },
  {
    title: "파이썬 데이터 분석 입문",
    description: "Python, Pandas, Matplotlib로 데이터 분석의 기초를 다져요. 엑셀로 하던 일을 코드로 옮기는 첫걸음이에요.",
    category: "data",
    color: "mint",
    listPrice: 55_000,
    price: 55_000,
    published: false,
    launchedMonthsAgo: null,
    weight: 0,
    createdDaysAgo: 19,
    outcomes: ["파이썬 개발 환경 만들기", "Pandas로 표 데이터를 읽고 정리하기"],
    sections: [
      {
        title: "파이썬 기초",
        lessons: [
          { title: "파이썬 설치 및 환경설정", type: "video", duration: "10:00", preview: true },
          { title: "변수와 자료형", type: "video", duration: "16:30" },
        ],
      },
      {
        title: "Pandas로 표 다루기",
        lessons: [{ title: "DataFrame 만들기", type: "video", duration: "18:00" }],
      },
    ],
  },
];

export interface SeedProduct {
  title: string;
  type: ProductType;
  price: number;
  description: string;
  launchedMonthsAgo: number;
  weight: number;
}

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    title: "개발자 이력서 노션 템플릿",
    type: "notion",
    price: 15_000,
    description: "실무에서 바로 쓰는 개발자 이력서 템플릿이에요. ATS에 잘 읽히는 구성과 항목별 작성 예시가 들어 있어요.",
    launchedMonthsAgo: 11,
    weight: 0.34,
  },
  {
    title: "React 치트시트 PDF",
    type: "pdf",
    price: 9_900,
    description: "React 핵심 개념을 한 장에 정리한 치트시트예요. A3 출력용 파일도 함께 드려요.",
    launchedMonthsAgo: 11,
    weight: 0.38,
  },
  {
    title: "프로젝트 관리 노션 대시보드",
    type: "notion",
    price: 25_000,
    description: "스프린트, 백로그, 회고까지 한곳에서 관리하는 1인 개발자용 노션 대시보드예요.",
    launchedMonthsAgo: 9,
    weight: 0.16,
  },
  {
    title: "UX 리서치 체크리스트 PDF",
    type: "pdf",
    price: 12_000,
    description: "사용자 인터뷰와 사용성 테스트를 준비할 때 빠뜨리기 쉬운 항목을 모은 체크리스트예요.",
    launchedMonthsAgo: 8,
    weight: 0.12,
  },
];

/** The legacy POC's eight students, kept as the school's first learners. */
export const FIRST_LEARNERS = [
  { name: "이민수", email: "minsu@example.com" },
  { name: "박지연", email: "jiyeon@example.com" },
  { name: "최동현", email: "donghyun@example.com" },
  { name: "김하은", email: "haeun@example.com" },
  { name: "정우진", email: "woojin@example.com" },
  { name: "한서영", email: "seoyoung@example.com" },
  { name: "오준석", email: "junseok@example.com" },
  { name: "윤채린", email: "chaerin@example.com" },
];

export const SURNAMES: [string, string][] = [
  ["김", "kim"],
  ["이", "lee"],
  ["박", "park"],
  ["최", "choi"],
  ["정", "jung"],
  ["강", "kang"],
  ["조", "cho"],
  ["윤", "yoon"],
  ["장", "jang"],
  ["임", "lim"],
  ["한", "han"],
  ["오", "oh"],
  ["서", "seo"],
  ["신", "shin"],
  ["권", "kwon"],
  ["황", "hwang"],
  ["안", "ahn"],
  ["송", "song"],
  ["류", "ryu"],
  ["홍", "hong"],
];

export const GIVEN_NAMES: [string, string][] = [
  ["민준", "minjun"],
  ["서연", "seoyeon"],
  ["지호", "jiho"],
  ["하은", "haeun"],
  ["도윤", "doyun"],
  ["서윤", "seoyun"],
  ["예준", "yejun"],
  ["지우", "jiwoo"],
  ["시우", "siwoo"],
  ["수아", "sua"],
  ["주원", "juwon"],
  ["지유", "jiyu"],
  ["하준", "hajun"],
  ["채원", "chaewon"],
  ["지후", "jihu"],
  ["윤서", "yunseo"],
  ["준서", "junseo"],
  ["다은", "daeun"],
  ["건우", "gunwoo"],
  ["예린", "yerin"],
  ["현우", "hyunwoo"],
  ["수빈", "subin"],
  ["우진", "woojin"],
  ["지민", "jimin"],
  ["선우", "sunwoo"],
  ["서현", "seohyun"],
  ["유준", "yujun"],
  ["민서", "minseo"],
  ["연우", "yeonwoo"],
  ["하린", "harin"],
  ["정우", "jungwoo"],
  ["소율", "soyul"],
  ["승민", "seungmin"],
  ["예은", "yeeun"],
  ["시윤", "siyun"],
  ["가은", "gaeun"],
  ["민재", "minjae"],
  ["채은", "chaeeun"],
  ["은우", "eunwoo"],
  ["나연", "nayeon"],
];

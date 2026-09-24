import type { BoardCategory } from "../domain/board";
import type { Category } from "../domain/issues";
import type { Audience, Tier } from "../domain/tiers";

/**
 * Sample content for a new workspace: a fictional publication ("작은 회사 통신")
 * by a fictional editor. People, sponsors and figures are invented and are
 * labelled as sample data in the UI. Essays avoid real-world statistics.
 */

export const SAMPLE_PUBLICATION = {
  name: "작은 회사 통신",
  description: "혼자 또는 작게 일하는 사람들을 위한 주간 레터. AI와 도구, 돈과 일하는 방식을 매주 화요일 아침에 보냅니다.",
  editorName: "윤서하",
  sendHour: 7,
  revenueGoal: 5_000_000,
  paidGoal: 300,
};

export const SAMPLE_PLANS: { tier: Tier; name: string; price: number; summary: string; perks: string[] }[] = [
  {
    tier: "free",
    name: "무료",
    price: 0,
    summary: "매주 화요일 아침, 전체 공개 호를 받아 봅니다.",
    perks: ["전체 공개 호 이메일 발송", "지난 호 중 전체 공개 호 열람"],
  },
  {
    tier: "basic",
    name: "베이직",
    price: 9_900,
    summary: "유료 호까지 모두 읽고 독자 마당에서 이야기합니다.",
    perks: ["모든 유료 호 열람", "지난 호 전체 열람", "독자 마당 글쓰기·댓글", "월간 도구 리포트"],
  },
  {
    tier: "pro",
    name: "프로",
    price: 29_900,
    summary: "심층 리포트와 오프라인 모임까지 함께합니다.",
    perks: ["베이직의 모든 혜택", "프로 전용 심층 리포트", "분기별 오프라인 모임 초대", "새 호 하루 먼저 받기"],
  },
];

export interface SampleIssue {
  title: string;
  lede: string;
  category: Category;
  audience: Audience;
  body: string;
}

/** Published issues, oldest first (one a week; the first is the launch issue). */
export const PUBLISHED_ISSUES: SampleIssue[] = [
  {
    title: "혼자 일하는 사람의 첫 번째 도구함",
    lede: "창업 첫 달에 깔았다가 지운 앱, 끝까지 남은 앱. 도구는 적을수록 오래 갑니다.",
    category: "lifestyle",
    audience: "everyone",
    body: `안녕하세요, 작은 회사 통신을 시작합니다. 첫 호는 가장 많이 받은 질문으로 엽니다. "혼자 일하면 어떤 도구를 쓰나요?"

솔직히 말하면 첫 달에는 스무 개 가까운 서비스를 깔았습니다. 할 일 관리만 세 개였어요. 한 달 뒤에 남은 건 다섯 개였습니다.

## 끝까지 남은 다섯 가지

- 메모 한 곳: 생각은 한곳에 모여야 다시 찾습니다.
- 캘린더 하나: 일정과 마감을 같은 화면에서 봅니다.
- 문서 저장소 하나: 계약서와 견적서는 폴더 이름부터 정합니다.
- 회계 장부 하나: 매주 금요일 30분, 들어온 돈과 나간 돈을 적습니다.
- 뉴스레터: 여러분이 지금 읽고 있는 이것입니다.

> 도구를 고르는 기준은 기능이 아니라 "내가 매주 여는가"였습니다.

다음 호부터는 매주 화요일 아침 7시에 찾아갑니다. 궁금한 주제가 있으면 독자 마당에 남겨 주세요.`,
  },
  {
    title: "견적서 한 장에 담아야 할 다섯 줄",
    lede: "금액보다 먼저 적어야 하는 것들. 분쟁의 절반은 견적서에서 시작됩니다.",
    category: "business",
    audience: "everyone",
    body: `첫 외주 분쟁은 금액이 아니라 "어디까지가 일인가"에서 시작됐습니다. 그 뒤로 견적서에 꼭 다섯 줄을 적습니다.

- 하는 일과 하지 않는 일
- 수정 횟수
- 중간 확인 날짜
- 대금 지급 시점
- 일정이 밀렸을 때의 약속

> 견적서는 가격표가 아니라 일의 경계선입니다.`,
  },
  {
    title: "첫 고객은 생각보다 가까이 있다",
    lede: "광고비를 쓰기 전에, 이미 나를 아는 사람 열 명에게 먼저 물어보세요.",
    category: "marketing",
    audience: "everyone",
    body: `첫 고객을 찾으려고 광고부터 알아봤습니다. 그런데 실제 첫 계약은 예전 동료의 소개에서 나왔습니다.

## 먼저 연락할 열 명

- 전 직장 동료
- 같은 업계 모임에서 만난 사람
- 내 글에 댓글을 남긴 사람

부탁이 아니라 근황을 전하세요. "요즘 이런 일을 합니다" 한 줄이면 충분합니다.`,
  },
  {
    title: "노션 대신 종이 노트로 돌아간 이유",
    lede: "생각은 종이에서, 기록은 화면에서. 도구를 나눴더니 머리가 가벼워졌습니다.",
    category: "lifestyle",
    audience: "everyone",
    body: `모든 것을 한 앱에 넣으려다 오히려 생각이 흩어졌습니다. 그래서 아침 30분은 종이 노트만 폅니다.

생각을 정리하는 일은 종이에서, 결정을 기록하는 일은 화면에서 합니다. 옮겨 적는 수고가 오히려 한 번 더 걸러 주는 체가 되었습니다.`,
  },
  {
    title: "계약서에서 꼭 확인할 세 조항",
    lede: "법률 자문이 아닌, 혼자 일하는 사람의 체크리스트. 서명 전에 이 세 곳만은 읽어 보세요.",
    category: "business",
    audience: "paid",
    body: `계약서를 끝까지 읽는 사람은 많지 않습니다. 저도 그랬습니다. 한 번 크게 곤란을 겪은 뒤로는 세 조항만은 꼭 읽습니다.

---

## 1. 대금 지급 조건

"검수 완료 후"라면 검수의 기준과 기한이 있는지 확인하세요.

## 2. 저작권과 사용 범위

결과물을 내 포트폴리오에 써도 되는지 적혀 있나요?

## 3. 계약 해지

중간에 멈추면 그때까지의 일은 어떻게 정산하나요?

> 이 글은 법률 자문이 아닙니다. 큰 계약은 전문가와 함께 보세요.`,
  },
  {
    title: "AI로 상세페이지 문구 쓰기, 어디까지 맡길까",
    lede: "초안은 AI에게, 마지막 한 문장은 나에게. 직접 써 본 비교.",
    category: "tech",
    audience: "everyone",
    body: `상세페이지 문구를 AI에게 맡겨 보니 초안은 빨랐지만 모두 비슷한 말투였습니다.

## 맡긴 것

- 기능 목록 정리
- 자주 묻는 질문 초안

## 직접 쓴 것

- 첫 문장
- 가격 옆의 한 줄

고객이 기억하는 건 결국 사람이 쓴 한 문장이었습니다.`,
  },
  {
    title: "작은 브랜드의 로고, 얼마를 써야 할까",
    lede: "처음부터 완벽한 로고는 없습니다. 바꾸기 쉬운 로고가 있을 뿐.",
    category: "design",
    audience: "everyone",
    body: `로고에 큰돈을 쓰기 전에 이름부터 써 보세요. 글자만으로 된 로고는 바꾸기 쉽고, 어디에 놓아도 읽힙니다.

- 흑백으로 먼저 확인하기
- 작게 줄였을 때 읽히는지 보기
- 1년 뒤에 바꿔도 괜찮다고 마음먹기`,
  },
  {
    title: "월말 정산 30분 루틴",
    lede: "숫자를 미루면 불안이 쌓입니다. 매달 마지막 금요일, 30분이면 충분합니다.",
    category: "business",
    audience: "paid",
    body: `매달 마지막 금요일 오후 네 시, 30분 타이머를 켭니다.

---

## 순서

- 들어온 돈 확인 (10분)
- 나간 돈 분류 (10분)
- 다음 달 예상 지출 적기 (10분)

> 정산은 회계가 아니라 다음 달을 위한 대화입니다.`,
  },
  {
    title: "SNS 없이 알리는 법",
    lede: "인스타그램을 하지 않아도 사람들이 찾아오게 만드는 세 가지 경로.",
    category: "marketing",
    audience: "paid",
    body: `SNS를 운영할 시간이 없어서 다른 길을 찾았습니다.

---

- 한 달에 한 번, 업계 뉴스레터에 기고하기
- 고객 사례를 고객의 허락을 받아 글로 남기기
- 작은 모임에서 15분 발표하기

느리지만, 찾아오는 사람의 질문이 훨씬 구체적입니다.`,
  },
  {
    title: "재택 1년 차의 하루 시간표",
    lede: "출근하지 않는 날에도 하루에는 문이 필요합니다.",
    category: "lifestyle",
    audience: "everyone",
    body: `재택 1년 차, 가장 어려웠던 건 일의 시작과 끝이 없다는 것이었습니다.

## 지금의 시간표

- 9시: 동네 한 바퀴 걷고 책상 앞으로
- 12시: 점심은 반드시 밖에서
- 6시: 노트북 덮고 내일 할 일 세 줄

집이 사무실이 되지 않도록, 하루에 문을 달아 두었습니다.`,
  },
  {
    title: "1인 회사의 첫 채용, 외주와 정규직 사이",
    lede: "프로 독자를 위한 리포트. 혼자에서 둘이 되는 순간에 따져 볼 것들.",
    category: "business",
    audience: "pro",
    body: `혼자 하던 일이 넘치기 시작하면 첫 번째 동료를 고민하게 됩니다.

---

## 외주가 맞는 경우

- 일의 범위가 분명할 때
- 결과물로 평가할 수 있을 때

## 채용이 맞는 경우

- 매주 반복되는 일이 쌓일 때
- 내가 없어도 결정을 내려야 할 때

> 첫 채용은 사람을 뽑는 일이 아니라, 내 일을 나누는 방식을 정하는 일입니다.`,
  },
  {
    title: "검색 유입은 끝났다는 말에 대하여",
    lede: "AI 답변이 검색 결과를 덮어도, 사람이 찾아오는 글의 조건은 크게 바뀌지 않았습니다.",
    category: "marketing",
    audience: "everyone",
    body: `요즘 모임에 나가면 "이제 블로그 글은 소용없지 않나요?"라는 말을 자주 듣습니다. 검색창 위에 AI 요약이 먼저 뜨니 그럴 만합니다.

그런데 제 작은 사이트의 유입을 몇 달 지켜보니, 줄어든 건 **누구나 쓸 수 있는 글**이었고 늘어난 건 **나만 쓸 수 있는 글**이었습니다.

## 여전히 찾아오는 글

- 직접 해 본 과정과 실패가 담긴 글
- 특정 상황을 정확히 겨냥한 글 ("1인 법인 첫 부가세 신고" 같은)
- 표, 체크리스트처럼 다시 돌아와 쓰는 글

## 줄어든 글

- 개념 정의, 용어 설명
- 여러 글을 모아 요약한 글

결국 검색 최적화의 핵심은 기술이 아니라 경험의 밀도라는 생각입니다. 다음 주에는 제가 쓰는 글감 노트 양식을 공유할게요.`,
  },
  {
    title: "투자 뉴스를 읽는 1인 창업자의 자세",
    lede: "큰 라운드 소식에 흔들리지 않고, 내 사업에 쓸모 있는 정보만 건지는 법.",
    category: "business",
    audience: "paid",
    body: `스타트업 투자 기사가 쏟아지는 주간이면 괜히 마음이 급해집니다. 우리도 투자를 받아야 하나, 이 방향이 맞나.

이번 호는 투자 뉴스를 "내 사업의 재료"로 바꿔 읽는 방법을 정리했습니다.

---

## 기사에서 건질 것 세 가지

- **누가 돈을 내는가**: 투자받은 회사의 고객이 누구인지 보면, 지갑이 열리는 시장이 보입니다.
- **무엇을 대체하는가**: 새 서비스가 없애려는 기존의 불편은, 작은 회사가 먼저 풀 수 있는 문제이기도 합니다.
- **무엇을 말하지 않는가**: 매출 대신 사용자 수만 말한다면, 아직 가격을 찾는 중일 가능성이 큽니다.

## 버릴 것

기업 가치 숫자와 투자사 이름은 대부분 내 사업과 상관이 없습니다. 비교는 불안만 키웁니다.

> 남의 라운드는 날씨 예보처럼 읽으세요. 우산을 챙길지 정하는 데만 쓰면 됩니다.

다음 달 프로 리포트에서는 투자 없이 연 매출을 키운 작은 SaaS 사례를 다룹니다.`,
  },
  {
    title: "AI 에이전트에게 일을 맡기는 법: 작게, 구체적으로",
    lede: "“알아서 해 줘”는 실패합니다. 잘 되는 위임에는 입력, 기준, 확인 단계가 있습니다.",
    category: "tech",
    audience: "everyone",
    body: `지난 몇 주 동안 반복 업무 몇 가지를 AI 에이전트에게 맡겨 봤습니다. 결과는 반반이었어요. 성공과 실패를 가른 건 모델이 아니라 제가 일을 나눈 방식이었습니다.

## 잘 된 일

- 고객 문의 메일을 읽고 유형별로 분류하기
- 견적서 초안에 지난 계약 조건을 채워 넣기
- 매주 발행한 글에서 인용할 문장 뽑기

## 잘 안 된 일

- "이번 달 마케팅 계획 세워 줘"
- "홈페이지 문구 좋게 바꿔 줘"

차이는 분명했습니다. 잘 된 일에는 **정해진 입력**, **판단 기준**, **내가 확인할 지점**이 있었습니다.

> 사람에게 일을 맡길 때와 같습니다. 끝났는지 알 수 있어야 맡길 수 있습니다.

독자 마당에 여러분이 맡겨 본 일을 나눠 주세요. 다음 호에서 몇 가지를 소개하겠습니다.`,
  },
  {
    title: "월 구독료를 정하는 세 가지 질문",
    lede: "가격은 원가가 아니라 고객이 아끼는 시간에서 출발합니다. 베이직과 프로를 나눈 기준도 공개합니다.",
    category: "business",
    audience: "paid",
    body: `독자 마당에 "구독 서비스 가격을 어떻게 정하셨나요?"라는 질문이 올라왔습니다. 이 레터의 가격을 정할 때 스스로 던진 세 가지 질문으로 답을 대신합니다.

---

## 1. 이 돈으로 무엇을 아끼는가

독자가 이 레터로 아끼는 건 정보를 찾고 거르는 시간입니다. 한 달에 두세 시간을 아낀다면, 그 시간의 가치가 가격의 천장입니다.

## 2. 누가 더 내고 싶어 하는가

모든 독자가 같은 걸 원하지 않았습니다. 대부분은 글을 원했고, 일부는 **사람**을 원했습니다. 그래서 프로 플랜에 모임과 심층 리포트를 넣었습니다.

## 3. 올릴 수 있는가

처음 가격은 낮게 시작해도 됩니다. 다만 올릴 때 설명할 수 있어야 합니다. 저는 "새 혜택이 생길 때만 올린다"는 원칙을 정했습니다.

- 베이직: 글을 모두 읽고 싶은 분
- 프로: 글 너머의 연결이 필요한 분

다음 호에서는 무료에서 유료로 넘어오는 순간에 대해 이야기하겠습니다.`,
  },
  {
    title: "디자인 시스템, 1인 회사에도 필요할까",
    lede: "컴포넌트 라이브러리보다 먼저 필요한 건 “같은 건 같게”라는 약속 몇 줄입니다.",
    category: "design",
    audience: "everyone",
    body: `디자인 시스템이라고 하면 큰 회사의 두꺼운 문서가 떠오릅니다. 혼자 일하는 사람에게는 사치처럼 보이죠.

하지만 혼자일수록 시스템이 필요했습니다. 석 달 전의 내가 만든 버튼과 오늘의 내가 만든 버튼이 달라지는 걸 막을 사람이 없으니까요.

## 제가 쓰는 한 장짜리 약속

- 색은 네 가지만: 글자, 바탕, 강조, 경고
- 글자 크기는 다섯 단계만
- 간격은 4의 배수만
- 버튼 모양은 하나, 크기는 둘

> 시스템은 문서가 아니라 반복을 줄이는 습관입니다.

이 네 줄을 지키는 것만으로 새 페이지를 만드는 시간이 눈에 띄게 줄었습니다. 여러분의 약속은 무엇인가요?`,
  },
  {
    title: "작은 SaaS가 첫 매출 1억에 닿기까지",
    lede: "프로 독자를 위한 심층 리포트. 가상의 1인 SaaS 사례로 가격, 채널, 이탈을 단계별로 해부합니다.",
    category: "business",
    audience: "pro",
    body: `이번 프로 리포트는 여러 창업자와의 대화를 바탕으로 재구성한 가상의 사례입니다. 숫자는 설명을 위한 예시입니다.

주인공은 소규모 학원을 위한 수강료 관리 도구를 혼자 만든 개발자입니다.

---

## 1단계: 가격보다 먼저, 한 명의 고객

첫 고객은 동네 학원 원장님 한 분이었습니다. 무료로 쓰게 하는 대신 매주 30분씩 불편한 점을 들었습니다.

## 2단계: 채널은 하나만

온라인 광고 대신 원장님들이 모이는 커뮤니티 한 곳에 꾸준히 사용기를 올렸습니다.

## 3단계: 이탈에서 배우기

해지한 고객에게 빠짐없이 전화를 걸었습니다. 이유의 절반은 기능이 아니라 **처음 설정이 어렵다**는 것이었습니다.

- 설정 대행을 유료 옵션으로 추가
- 첫 주 체크리스트 메일 발송
- 월 결제 대신 연 결제 할인 도입

> 성장의 대부분은 새 기능이 아니라 이미 있는 고객을 붙잡는 데서 나왔습니다.

다음 분기 오프라인 모임에서 이 사례를 함께 뜯어보겠습니다.`,
  },
  {
    title: "마케팅 자동화 도구, 무엇을 버렸나",
    lede: "여섯 개를 써 보고 두 개만 남겼습니다. 버린 이유가 고른 이유보다 쓸모 있을지도 모릅니다.",
    category: "marketing",
    audience: "paid",
    body: `자동화는 편리하지만, 혼자 일하는 사람에게는 관리할 것이 하나 더 느는 일이기도 합니다. 지난 두 달 동안 마케팅 자동화 도구 여섯 개를 써 봤습니다.

---

## 버린 이유

- **설정이 일보다 길었다**: 한 번 보낼 메일을 위해 흐름도를 그리고 있었습니다.
- **요금이 연락처 수에 묶였다**: 독자가 늘수록 비용이 계단처럼 올랐습니다.
- **한국어 문장이 어색했다**: 템플릿 문구를 매번 고쳐야 했습니다.

## 남긴 두 가지

1. 신청 직후 보내는 환영 메일 한 통
2. 30일 동안 열지 않은 독자에게 보내는 안부 메일 한 통

> 자동화는 적게, 대신 매달 한 번은 직접 읽어 보세요.

독자 마당에 여러분의 "버린 도구" 목록도 기다립니다.`,
  },
  {
    title: "로컬 LLM을 내 노트북에서 돌려 본 한 달",
    lede: "고객 데이터를 밖으로 보내지 않고 AI를 쓸 수 있을까. 한 달 사용기와 솔직한 한계.",
    category: "tech",
    audience: "everyone",
    body: `고객 계약서를 AI에게 요약시키고 싶은데, 외부 서비스에 올리기는 망설여졌습니다. 그래서 한 달 동안 노트북에서 직접 돌리는 로컬 언어 모델을 써 봤습니다.

## 좋았던 점

- 인터넷이 없어도 돌아갑니다. 기차 안에서도 요약이 됩니다.
- 민감한 문서를 밖으로 보내지 않아도 됩니다.
- 사용량 요금 걱정이 없습니다.

## 아쉬웠던 점

- 긴 문서에서는 앞부분을 잊어버립니다.
- 노트북 팬이 쉬지 않고 돕니다.
- 한국어 문장이 가끔 번역투가 됩니다.

> 결론: 민감한 초안 작업은 로컬로, 공개해도 되는 일은 클라우드로 나눠 씁니다.

제가 쓰는 설정과 사양은 독자 마당 글에 정리해 두었습니다.`,
  },
  {
    title: "번아웃 없이 매주 보내는 법",
    lede: "스무 번째 호를 보내며 돌아본 루틴. 마감이 나를 끌고 가지 않게 하는 네 가지 장치.",
    category: "lifestyle",
    audience: "everyone",
    body: `어느새 스무 번째 호입니다. 매주 화요일 아침 7시를 한 번도 놓치지 않았지만, 두 번쯤은 월요일 새벽 세 시까지 원고를 붙잡고 있었습니다.

그래서 이번 호에서는 마감을 지키면서도 지치지 않으려고 만든 장치를 나눕니다.

## 네 가지 장치

- **글감 창고**: 떠오른 생각은 요일과 상관없이 한 문장으로 적어 둡니다. 월요일에 빈 화면을 마주하지 않으려고요.
- **목요일 초고**: 발송 닷새 전에 초고를 끝냅니다. 초고는 형편없어도 됩니다.
- **토요일 휴무**: 토요일에는 레터 관련 알림을 모두 끕니다.
- **예약 발행**: 원고가 끝나면 바로 예약합니다. 월요일 밤의 나를 믿지 않기로 했습니다.

> 꾸준함은 의지가 아니라 설계에서 나옵니다.

다음 달에는 첫 오프라인 모임을 엽니다. 프로 독자 여러분께는 따로 초대장을 보내겠습니다. 늘 읽어 주셔서 고맙습니다.`,
  },
];

export const SCHEDULED_ISSUE: SampleIssue = {
  title: "무료에서 유료로, 독자가 넘어오는 순간",
  lede: "유료 전환은 결제 버튼이 아니라 신뢰가 쌓인 어느 화요일에 일어납니다.",
  category: "business",
  audience: "paid",
  body: `지난 석 달 동안 무료 독자 중 일부가 유료로 넘어왔습니다. 전환이 일어난 날을 하나하나 살펴보니 공통점이 있었습니다.

---

## 전환이 일어난 날

- 유료 호의 미리보기가 딱 궁금한 곳에서 끝났을 때
- 독자 마당에서 누군가의 질문에 답이 달렸을 때
- 오프라인 모임 후기가 올라온 다음 날

## 전환이 일어나지 않은 날

할인 안내를 보낸 날에는 오히려 조용했습니다.

> 가격을 낮추는 것보다 가치를 보여 주는 편이 빨랐습니다.`,
};

export const DRAFT_ISSUES: SampleIssue[] = [
  {
    title: "10월 오프라인 모임 안내",
    lede: "작은 회사 운영자들의 저녁. 장소와 시간은 확정되는 대로 채웁니다.",
    category: "lifestyle",
    audience: "everyone",
    body: `10월 첫 오프라인 모임을 엽니다.

## 이렇게 진행해요

- 일시: (확정 전)
- 장소: 서울 성수동 인근 (확정 전)
- 주제: 혼자 일하는 사람의 가격 정하기

신청 방법은`,
  },
  {
    title: "고객 인터뷰 질문지 템플릿",
    lede: "",
    category: "business",
    audience: "paid",
    body: `고객 인터뷰를 할 때마다 쓰는 질문지를 정리 중입니다.

- 최근에 이 문제를 겪은 때는 언제인가요?
- 그때 어떻게 해결했나요?`,
  },
];

/** Named members who write on the board (they are also on the list). */
export const BOARD_MEMBERS: { name: string; email: string; tier: Tier }[] = [
  { name: "김민수", email: "minsu.kim@example.com", tier: "pro" },
  { name: "이지현", email: "jihyun.lee@example.com", tier: "basic" },
  { name: "정도윤", email: "doyun.jung@example.com", tier: "pro" },
  { name: "최유진", email: "yujin.choi@example.com", tier: "basic" },
  { name: "오세린", email: "serin.oh@example.com", tier: "basic" },
  { name: "강현석", email: "hyunseok.kang@example.com", tier: "pro" },
];

export interface SamplePost {
  category: BoardCategory;
  /** Index into BOARD_MEMBERS, or "editor". */
  author: number | "editor";
  title: string;
  body: string;
  pinned?: boolean;
  daysAgo: number;
  comments: { author: number | "editor"; body: string; hoursAfter: number }[];
}

export const SAMPLE_POSTS: SamplePost[] = [
  {
    category: "notice",
    author: "editor",
    title: "독자 마당은 이렇게 써 주세요",
    body: `독자 마당은 유료 구독자분들이 서로의 일과 고민을 나누는 곳입니다.

- 이야기: 해 본 일, 배운 일, 실패한 일
- 질문: 막힌 일, 고민되는 결정

광고와 홍보 글은 에디터가 정리할 수 있어요. 서로의 시간을 아껴 주세요.`,
    pinned: true,
    daysAgo: 64,
    comments: [],
  },
  {
    category: "notice",
    author: "editor",
    title: "10월 오프라인 모임 수요 조사",
    body: `다음 달 저녁 모임을 준비하고 있습니다. 평일 저녁과 토요일 오후 중 언제가 좋으신지 댓글로 알려 주세요. 프로 독자분들께는 초대장을 따로 보내 드립니다.`,
    pinned: true,
    daysAgo: 3,
    comments: [
      { author: 2, body: "평일 저녁이면 목요일이 좋습니다!", hoursAfter: 2 },
      { author: 5, body: "토요일 오후 한 표요. 지방에서 올라가려면 주말이 편해요.", hoursAfter: 5 },
      { author: "editor", body: "의견 고맙습니다. 두 번 나눠 여는 것도 고민해 볼게요.", hoursAfter: 9 },
    ],
  },
  {
    category: "discussion",
    author: 0,
    title: "AI 에이전트에게 맡긴 지 석 달, 코드 리뷰 시간이 줄었어요",
    body: `지난 호를 읽고 반복 업무를 조금씩 맡겨 봤습니다. 가장 효과가 컸던 건 코드 리뷰 전 체크리스트 점검이었어요. 사람이 봐야 할 부분에만 집중하게 됐습니다. 다른 분들은 어떤 일을 맡기고 계신가요?`,
    daysAgo: 20,
    comments: [
      { author: 1, body: "저는 고객 문의 분류를 맡겼어요. 답장은 여전히 직접 씁니다.", hoursAfter: 3 },
      { author: 3, body: "보안 문서는 어떻게 관리하세요? 외부로 나가는 게 걱정돼서요.", hoursAfter: 6 },
      { author: 0, body: "민감한 코드는 로컬 모델로만 돌리고 있습니다.", hoursAfter: 8 },
    ],
  },
  {
    category: "question",
    author: 3,
    title: "B2B 구독, 무료 체험과 무료 플랜 중 무엇이 나을까요",
    body: `소규모 사무실용 도구를 준비 중입니다. 14일 무료 체험으로 갈지, 기능을 줄인 무료 플랜을 둘지 고민이에요. 경험 있으신 분들 조언 부탁드립니다.`,
    daysAgo: 12,
    comments: [
      { author: 0, body: "고객이 설정에 시간이 걸리는 도구라면 체험 기간이 짧게 느껴질 수 있어요.", hoursAfter: 1 },
      { author: 5, body: "저는 무료 플랜으로 시작했다가 지원 문의가 너무 많아 체험으로 바꿨습니다.", hoursAfter: 4 },
      { author: "editor", body: "다음 유료 호에서 이 주제를 조금 더 깊게 다뤄 볼게요.", hoursAfter: 20 },
    ],
  },
  {
    category: "question",
    author: 4,
    title: "마케팅 자동화, 월 5만 원 안에서 쓸 만한 조합이 있을까요",
    body: `지난 호 잘 읽었습니다. 환영 메일과 안부 메일 두 개만 남기셨다고 했는데, 그 정도면 어떤 도구로도 충분할까요?`,
    daysAgo: 9,
    comments: [{ author: 1, body: "저는 뉴스레터 도구의 기본 자동 메일만 써요. 따로 결제하지 않습니다.", hoursAfter: 5 }],
  },
  {
    category: "discussion",
    author: 2,
    title: "구독료 세 가지 질문, 저희 서비스에 적용해 봤습니다",
    body: `"이 돈으로 무엇을 아끼는가"에 답하다 보니 가격표 문구가 완전히 바뀌었어요. 기능 목록 대신 아끼는 시간을 적었더니 문의가 눈에 띄게 늘었습니다.`,
    daysAgo: 30,
    comments: [
      { author: 3, body: "문구 전후를 보여 주실 수 있나요? 궁금합니다.", hoursAfter: 12 },
    ],
  },
  {
    category: "discussion",
    author: 5,
    title: "로컬 LLM용 노트북 사양 공유합니다",
    body: `지난 호를 보고 저도 시도해 봤습니다. 메모리가 가장 중요했고, 긴 문서는 나눠서 넣으니 요약 품질이 훨씬 나아졌어요.`,
    daysAgo: 5,
    comments: [],
  },
  {
    category: "question",
    author: 1,
    title: "1인 법인 세금계산서, 다들 어떻게 발행하세요?",
    body: `법인 전환하고 처음으로 세금계산서를 발행해야 하는데, 매번 홈택스에 들어가기가 번거롭네요. 다들 어떻게 관리하시나요?`,
    daysAgo: 1,
    comments: [{ author: 4, body: "저는 월말에 몰아서 한 번에 합니다. 캘린더에 반복 일정으로 걸어 두었어요.", hoursAfter: 3 }],
  },
];

/** Fictional sponsors. `month` is months before the current one (0 = this month, -1 = next month). */
export const SAMPLE_SPONSORSHIPS: {
  sponsorName: string;
  message: string;
  amount: number;
  month: number;
  status: "proposed" | "booked" | "paid";
}[] = [
  { sponsorName: "모닝빈 로스터스", message: "화요일 아침 커피 한 잔. 원두 정기배송 첫 달 반값.", amount: 400_000, month: 4, status: "paid" },
  { sponsorName: "책방 한켠", message: "일하는 사람을 위한 이달의 책 세 권을 골랐습니다.", amount: 300_000, month: 4, status: "paid" },
  { sponsorName: "노트앤펜 문구", message: "기록하는 사람을 위한 줄 노트, 독자 할인 15%.", amount: 350_000, month: 4, status: "paid" },
  { sponsorName: "모닝빈 로스터스", message: "새 싱글 오리진 입고. 정기배송 독자 할인.", amount: 450_000, month: 3, status: "paid" },
  { sponsorName: "워크앤런 코워킹", message: "1인 회사를 위한 주소지 서비스와 라운지 이용권.", amount: 700_000, month: 2, status: "paid" },
  { sponsorName: "책방 한켠", message: "가을 추천 도서 북토크에 초대합니다.", amount: 300_000, month: 1, status: "paid" },
  { sponsorName: "달빛 세무회계", message: "1인 법인 첫 세무 상담 30분 무료.", amount: 600_000, month: 1, status: "paid" },
  { sponsorName: "노트앤펜 문구", message: "다이어리 사전 예약, 독자 전용 각인 무료.", amount: 400_000, month: 0, status: "booked" },
  { sponsorName: "워크앤런 코워킹", message: "10월 한 달 라운지 무료 체험권.", amount: 800_000, month: 0, status: "booked" },
  { sponsorName: "리듬 러닝클럽", message: "퇴근 후 5km, 초보자 러닝 모임 모집.", amount: 350_000, month: -1, status: "proposed" },
];

export const SAMPLE_MEMBERSHIP_ITEMS = [
  { item: "오프라인 모임 참가비", amount: 30_000 },
  { item: "연간 후원 멤버십", amount: 120_000 },
  { item: "북토크 참가비", amount: 25_000 },
] as const;

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
  ["지영", "jiyoung"],
  ["도현", "dohyun"],
  ["유나", "yuna"],
  ["재원", "jaewon"],
  ["하은", "haeun"],
  ["현우", "hyunwoo"],
  ["민정", "minjeong"],
  ["태훈", "taehun"],
  ["수빈", "subin"],
  ["영민", "youngmin"],
  ["지원", "jiwon"],
  ["승현", "seunghyun"],
  ["예린", "yerin"],
  ["준혁", "junhyuk"],
  ["다은", "daeun"],
  ["시우", "siwoo"],
  ["은지", "eunji"],
  ["성민", "sungmin"],
  ["가은", "gaeun"],
  ["동훈", "donghun"],
  ["보람", "boram"],
  ["주원", "juwon"],
  ["혜진", "hyejin"],
  ["상훈", "sanghun"],
  ["소연", "soyeon"],
  ["건우", "gunwoo"],
  ["미래", "mirae"],
  ["현준", "hyunjun"],
  ["아름", "areum"],
];

export const EMAIL_DOMAINS = ["example.com", "example.net", "example.org"] as const;

import type { ContentKind, Industry, Length, Tone } from "../domain/content";
import type { OrderStatus } from "../domain/pipeline";

/**
 * Demo workspace content. Every client, order and case here is fictional sample data
 * (the UI labels it 샘플); days are offsets from "today" in Asia/Seoul so the stand
 * always looks current.
 */

export interface SeedClient {
  name: string;
  industry: Industry;
  contactName: string;
  contactEmail: string;
}

export const SEED_CLIENTS = {
  bakery: { name: "밀과결 베이커리", industry: "F&B", contactName: "한지윤", contactEmail: "hello@milgyeol.example" },
  clinic: { name: "온담한의원", industry: "헬스케어", contactName: "박서진 실장", contactEmail: "office@ondam.example" },
  petSalon: { name: "리틀포 펫살롱", industry: "펫", contactName: "김도현", contactEmail: "littlepaw@petsalon.example" },
  academy: { name: "브릿지 영어학원", industry: "교육", contactName: "이수민 원장", contactEmail: "bridge@academy.example" },
  cleaner: { name: "청결연구소", industry: "생활/리빙", contactName: "정하은", contactEmail: "cs@cheonggyeol.example" },
  appliance: { name: "모아일렉", industry: "가전", contactName: "최민재", contactEmail: "md@moaelec.example" },
  skinLab: { name: "결 스킨랩", industry: "뷰티", contactName: "오예린", contactEmail: "brand@gyeolskin.example" },
  syrup: { name: "도담 수제청", industry: "F&B", contactName: "윤가을", contactEmail: "dodam@syrup.example" },
  woodshop: { name: "한결목공", industry: "제조", contactName: "장태호", contactEmail: "studio@hangyeol.example" },
  saas: { name: "스택노트", industry: "IT/테크", contactName: "서준영", contactEmail: "growth@stacknote.example" },
} satisfies Record<string, SeedClient>;

export type SeedClientKey = keyof typeof SEED_CLIENTS;

export interface SeedOrder {
  client: SeedClientKey;
  kind: ContentKind;
  topic: string;
  brief: string;
  keywords: string[];
  tone: Tone;
  length: Length;
  status: OrderStatus;
  /** Days relative to today. */
  created: number;
  due: number;
  delivered?: number;
  /** The editor's final copy for delivered or reviewed work (version 2 of the draft). */
  final?: { title: string; body: string };
}

export const SEED_ORDERS: SeedOrder[] = [
  {
    client: "bakery",
    kind: "blog",
    topic: "성수동 소금빵, 새벽 6시에 굽는 이유",
    brief: "매장 대표 메뉴인 소금빵 소개 글. 새벽에 굽는 이유와 버터·소금 이야기를 넣고, 오픈 시간 안내로 마무리해 주세요.",
    keywords: ["소금빵", "성수동 빵집", "성수 베이커리"],
    tone: "friendly",
    length: "short",
    status: "delivered",
    created: -52,
    due: -48,
    delivered: -48,
    final: {
      title: "[소금빵] 성수동 소금빵, 새벽 6시에 굽는 이유",
      body: `안녕하세요, 밀과결 베이커리입니다! 오늘은 저희 가게 문을 여는 소금빵 이야기를 해 보려고 해요. 성수동 빵집을 찾다가 이 글에 들어오셨다면, 끝까지 읽어 보세요.

## 왜 새벽 6시일까요?
소금빵은 구운 뒤 두세 시간 안이 가장 맛있어요. 겉은 버터가 스며 바삭하고, 속은 쫄깃한 그 순간이요. 그래서 저희는 아침 8시 오픈에 맞춰 새벽 6시부터 첫 판을 굽기 시작해요. 출근길에 들르시는 분들이 가장 맛있을 때 드실 수 있도록요.

## 버터와 소금, 딱 두 가지에 공들였어요
- 버터: 반죽 안에 돌돌 말아 넣는 버터는 굽는 동안 녹아 바닥을 튀기듯 익혀요. 바닥이 바삭한 이유예요.
- 소금: 위에 뿌리는 소금은 알갱이가 굵은 천일염을 써요. 한입 베어 물면 짠맛이 먼저, 버터의 고소함이 뒤따라와요.

## 이렇게 드시면 더 맛있어요
- 당일 드실 거라면 그대로, 겉이 바삭할 때 드세요.
- 다음 날 드실 거라면 에어프라이어에 160도로 3분만 데워 주세요.
- 냉동 보관은 일주일 안에 드시는 걸 권해요.

## 이용 안내
- 위치: 서울 성동구, 성수역 3번 출구에서 걸어서 5분 (샘플 정보)
- 운영 시간: 화–일 오전 8시–오후 7시, 월요일 휴무 (샘플 정보)
- 소금빵은 오전 8시, 11시, 오후 2시에 나와요.

성수동에 오시면 갓 나온 소금빵 한 봉지 들고 가세요. 다음 글에서는 계절 한정 메뉴를 소개할게요!

#소금빵 #성수동빵집 #성수베이커리`,
    },
  },
  {
    client: "skinLab",
    kind: "product",
    topic: "진정 수분 크림 50ml",
    brief: "민감성 피부용 수분 크림 상세페이지 문구. 과장 없이, 성분과 사용감 중심으로.",
    keywords: ["민감성 피부", "수분 크림", "저자극"],
    tone: "professional",
    length: "medium",
    status: "delivered",
    created: -45,
    due: -41,
    delivered: -40,
    final: {
      title: "진정 수분 크림 50ml | 민감성 피부 · 저자극",
      body: `## 한 줄 소개
예민한 날에도 부담 없이, 수분은 오래 머물게. 결 스킨랩 진정 수분 크림입니다.

## 이런 점이 좋아요
- 민감성 피부: 향료와 색소를 넣지 않았습니다. 바르는 순간의 자극을 줄이는 데 집중했습니다.
- 수분 크림: 가볍게 펴 발리고, 흡수된 뒤에도 당김 없이 촉촉함이 남습니다.
- 저자극: 피부 자극 테스트를 마친 제품입니다. 테스트 결과서는 상세 이미지에서 확인하실 수 있습니다. (샘플 문구)

## 이런 분께 추천해요
- 환절기마다 붉어지고 당기는 피부
- 여러 단계를 바르기보다 크림 하나로 마무리하고 싶은 분
- 순한 제품을 찾는 분

## 구성·사양
- 구성: 크림 본품 50ml
- 사용 기한: 제조일로부터 24개월, 개봉 후 12개월
- 전성분: 상세페이지 하단 전성분 표를 참고해 주세요.

## 사용 방법
- 세안 후 토너로 결을 정돈합니다.
- 진주알 크기만큼 덜어 얼굴 안쪽에서 바깥쪽으로 펴 바릅니다.
- 건조한 부위에는 한 번 더 얹어 가볍게 두드려 흡수시킵니다.`,
    },
  },
  {
    client: "academy",
    kind: "ad",
    topic: "초등 파닉스 여름 특강",
    brief: "학부모 대상 여름방학 파닉스 특강 모집 문구. 검색광고와 학원 SNS용.",
    keywords: ["파닉스", "초등 영어", "여름방학 특강"],
    tone: "witty",
    length: "medium",
    status: "delivered",
    created: -38,
    due: -34,
    delivered: -35,
    final: {
      title: "초등 파닉스 여름 특강 광고 문구",
      body: `## 헤드라인
- A. 방학 4주, 알파벳이 소리로 들리기 시작해요
- B. 파닉스? 이번 여름에 끝내요
- C. 읽을 줄 아는 아이는 영어가 재밌어요

## 서브 카피
- 초등 1–3학년, 소리와 글자를 잇는 4주 과정
- 반마다 여섯 명, 한 명씩 소리 내 읽어 보는 수업

## 검색광고
- 제목 (15자 이내): 초등 파닉스 여름 특강
- 설명 (45자 이내): 브릿지 영어학원 여름방학 파닉스 4주 과정. 소수 정원 모집 중.

## SNS 게시물
파닉스? 이번 여름에 끝내요.
알파벳을 외우는 대신, 소리를 듣고 읽는 법을 익혀요.
여름방학 4주 특강, 반마다 여섯 명만 모집합니다. (샘플 일정)
신청은 프로필 링크에서!
#파닉스 #초등영어 #여름방학특강 #브릿지영어학원`,
    },
  },
  {
    client: "clinic",
    kind: "blog",
    topic: "환절기 비염, 한방으로 관리하는 법",
    brief: "환절기 비염 관리 정보성 글. 의학적 효과를 단정하지 말고 생활 관리 위주로. 진료 안내 포함.",
    keywords: ["환절기 비염", "한의원", "비염 관리"],
    tone: "professional",
    length: "short",
    status: "delivered",
    created: -31,
    due: -26,
    delivered: -27,
    final: {
      title: "[환절기 비염] 환절기 비염, 한방으로 관리하는 법",
      body: `아침저녁으로 공기가 차가워지면 코가 먼저 반응하는 분들이 많습니다. 이 글에서는 환절기 비염을 생활 속에서 관리하는 방법과, 한의원에서 함께 살펴보는 부분을 정리했습니다.

## 환절기에 비염이 심해지는 이유
하루 사이 기온 차가 커지면 코 점막이 온도와 습도 변화에 적응하느라 예민해집니다. 여기에 건조한 공기와 먼지가 더해지면 재채기, 콧물, 코막힘이 쉽게 나타납니다.

## 비염 관리: 생활에서 확인할 포인트
- 실내 습도를 40–60%로 유지해 코 점막이 마르지 않게 합니다.
- 외출 뒤에는 미지근한 식염수로 코를 가볍게 헹굽니다.
- 찬 음료보다 따뜻한 물을 자주 마십니다.
- 잠들기 전 휴대폰 사용을 줄여 수면 시간을 확보합니다.

## 한의원에서는 이렇게 살펴봅니다
한의원에서는 코 증상만이 아니라 평소 체질, 소화 상태, 수면 습관을 함께 묻습니다. 같은 비염이라도 생활 습관에 따라 관리 방향이 달라지기 때문입니다. 상담 후 침 치료, 한약, 생활 지도 가운데 맞는 방법을 권해 드립니다.

## 자주 묻는 질문
Q. 한방 치료만으로 비염이 낫나요?
A. 증상과 체질에 따라 다릅니다. 진료 후 상태에 맞는 방법을 설명해 드리며, 필요하면 다른 진료과 상담도 권해 드립니다.

Q. 아이도 진료받을 수 있나요?
A. 네, 소아 진료도 가능합니다. 보호자와 함께 내원해 주세요.

## 이용 안내
- 위치: 서울 마포구, 망원역 1번 출구 앞 (샘플 정보)
- 진료 시간: 평일 오전 9시 30분–오후 7시, 토요일 오후 2시까지 (샘플 정보)
- 예약: 네이버 예약 또는 전화

환절기 비염은 꾸준한 관리가 중요합니다. 증상이 오래간다면 가까운 한의원에서 상담을 받아 보시기 바랍니다.

#환절기비염 #한의원 #비염관리`,
    },
  },
  {
    client: "appliance",
    kind: "product",
    topic: "무선 미니 가습기 300ml",
    brief: "사무실 책상용 무선 미니 가습기 스마트스토어 상세 문구. 충전 방식과 소음 강조.",
    keywords: ["무선 가습기", "사무실 가습기", "미니 가습기"],
    tone: "friendly",
    length: "medium",
    status: "delivered",
    created: -24,
    due: -20,
    delivered: -18,
    final: {
      title: "무선 미니 가습기 300ml | 무선 가습기 · 사무실 가습기",
      body: `## 한 줄 소개
책상 위 손바닥만 한 자리, 거기면 충분해요. 선 없이 어디든 두는 모아일렉 무선 미니 가습기예요.

## 이런 점이 좋아요
- 무선 가습기: USB-C로 충전해 두면 선 없이 쓸 수 있어요. 콘센트 위치를 신경 쓰지 않아도 돼요.
- 사무실 가습기: 조용한 초음파 방식이라 회의 중에도 거슬리지 않아요.
- 미니 가습기: 300ml 물통 하나로 약한 모드에서 반나절 정도 쓸 수 있어요. (샘플 사양)

## 이런 분께 추천해요
- 사무실 책상이 건조해 눈과 목이 불편한 분
- 침대 옆에 작은 가습기를 두고 싶은 분
- 선물할 작은 생활 가전을 찾는 분

## 구성·사양
- 구성: 가습기 본체, 필터 2개, USB-C 케이블
- 크기: 지름 8cm, 높이 17cm (샘플 사양)
- 물통 용량: 300ml

## 사용 방법
- 처음 쓰기 전 필터를 물에 10분 정도 담가 주세요.
- 물은 MAX 선 아래까지만 채워 주세요.
- 이틀에 한 번 물통을 비우고 말려 주세요.`,
    },
  },
  {
    client: "syrup",
    kind: "ad",
    topic: "수제 자몽청 가을 한정 출시",
    brief: "가을 한정 자몽청 출시 광고. 선물 세트 강조, 감성적인 톤. 카카오 채널 메시지 포함.",
    keywords: ["수제청", "자몽청", "선물 세트"],
    tone: "emotional",
    length: "long",
    status: "delivered",
    created: -17,
    due: -13,
    delivered: -13,
    final: {
      title: "수제 자몽청 가을 한정 출시 광고 문구",
      body: `## 헤드라인
- A. 선선한 바람 끝에, 자몽 한 잔
- B. 올가을에만 만나는 도담 자몽청
- C. 마음을 담아 건네는 가을 선물 세트

## 서브 카피
- 한 알 한 알 손으로 썰어 설탕에 재운 수제청
- 따뜻한 차로도, 시원한 에이드로도

## 검색광고
- 제목 (15자 이내): 도담 수제 자몽청
- 설명 (45자 이내): 가을 한정 수제 자몽청과 선물 세트. 지금 사전 주문을 받고 있어요.

## SNS 게시물
선선한 바람 끝에, 자몽 한 잔.
올가을에만 만나는 도담 자몽청이 나왔어요.
자몽청 두 병을 담은 선물 세트도 함께 준비했어요. (샘플 구성)
링크에서 이야기를 이어 보세요.
#수제청 #자몽청 #선물세트 #가을한정

## 배너 문구
- 메인: 올가을에만 만나는 도담 자몽청
- 보조: 마음을 담아 건네는 가을 선물
- 버튼: 지금 보기

## 카카오톡 채널 메시지
(광고) 도담 수제청 가을 소식을 전해 드립니다.
마음을 담아 건네는 가을 선물 세트, 자몽청 두 병을 예쁜 상자에 담았어요.
사전 주문은 이번 주 일요일까지예요. (샘플 일정)
수신 거부: 채널 차단`,
    },
  },
  {
    client: "petSalon",
    kind: "blog",
    topic: "노견 미용, 짧고 편안하게 받는 법",
    brief: "노견 보호자를 위한 미용 안내 글. 짧은 시간·휴식 위주 미용 방식 소개.",
    keywords: ["노견 미용", "강아지 미용", "펫살롱"],
    tone: "emotional",
    length: "short",
    status: "delivered",
    created: -12,
    due: -8,
    delivered: -9,
    final: {
      title: "[노견 미용] 노견 미용, 짧고 편안하게 받는 법",
      body: `오래 곁을 지켜 준 강아지일수록, 미용 한 번도 조심스럽습니다. 오늘은 리틀포 펫살롱이 노견 미용을 어떻게 하는지 천천히 이야기해 보려 합니다.

## 왜 노견 미용은 달라야 할까
나이가 들면 오래 서 있는 것도, 낯선 소리도 버겁습니다. 그래서 노견 미용은 예쁘게보다 편안하게가 먼저입니다.

## 강아지 미용, 이렇게 나눠서 합니다
- 미용 시간을 한 번에 몰지 않고, 중간중간 쉬어 갑니다.
- 드라이어는 가장 약한 바람으로, 귀와 얼굴 주변은 수건으로 말립니다.
- 보호자가 원하시면 미용 내내 곁에 계실 수 있습니다.

## 짧게, 나눠서 받는 미용
노견 미용은 한 번에 끝내려 하지 않습니다. 오늘은 발과 얼굴만, 다음 주에는 몸 전체처럼 두세 번에 나눠 받으면 아이가 덜 지칩니다. 미용 중에 숨이 가빠 보이면 바로 멈추고, 보호자와 다음 일정을 다시 정합니다.

## 펫살롱에 오시기 전에
- 최근 건강 검진 결과나 복용 중인 약이 있다면 알려 주세요.
- 미용 전에는 산책으로 가볍게 긴장을 풀어 주세요.
- 아이가 좋아하는 담요나 장난감을 가져오시면 낯선 곳에서도 한결 편안해합니다.

## 이용 안내
- 위치: 서울 송파구, 석촌호수 동호 근처 (샘플 정보)
- 노견 미용은 하루 두 타임만 예약받습니다. (샘플 정보)

오늘도 당신 곁의 작은 친구가, 조금 더 편안하기를.

#노견미용 #강아지미용 #펫살롱`,
    },
  },
  {
    client: "saas",
    kind: "blog",
    topic: "작은 팀을 위한 회의록 자동화",
    brief: "B2B SaaS 콘텐츠 마케팅용. 5–20인 팀이 회의록을 자동화하는 방법, 제품 홍보는 마지막에 짧게.",
    keywords: ["회의록", "업무 자동화", "협업 툴"],
    tone: "professional",
    length: "short",
    status: "delivered",
    created: -9,
    due: -5,
    delivered: -4,
    final: {
      title: "[회의록] 작은 팀을 위한 회의록 자동화",
      body: `회의는 늘 하는데 회의록은 늘 밀립니다. 작은 팀일수록 기록을 맡을 사람이 따로 없기 때문입니다. 이 글에서는 5–20명 규모의 팀이 회의록을 자동화할 때 순서대로 확인할 것을 정리했습니다.

## 회의록 자동화의 핵심
자동화의 목적은 회의록을 예쁘게 만드는 것이 아니라, 결정 사항과 할 일이 사라지지 않게 하는 것입니다. 그래서 기록 도구보다 기록 규칙을 먼저 정해야 합니다.

## 업무 자동화: 확인할 포인트
- 회의 전: 안건을 미리 적는 템플릿을 정합니다.
- 회의 중: 결정, 할 일, 담당자, 기한 네 가지만 표시합니다.
- 회의 후: 할 일을 협업 툴의 작업으로 자동 전환합니다.

## 협업 툴을 고를 때
이미 쓰는 메신저와 캘린더에 연결되는지 먼저 확인하십시오. 새 도구를 하나 더 여는 순간, 기록은 다시 밀리기 시작합니다.

## 시작 전 체크리스트
- 우리 팀 회의 중 기록이 꼭 필요한 회의는 무엇인가
- 결정 사항을 누가, 어디에 남기는가
- 할 일의 기한을 누가 챙기는가

## 문의 안내
- 스택노트 도입 상담: 홈페이지의 상담 신청 양식 (샘플 정보)

회의록 자동화는 도구보다 규칙에서 시작합니다. 이번 주 회의 하나에 먼저 적용해 보십시오.

#회의록 #업무자동화 #협업툴`,
    },
  },
  {
    client: "woodshop",
    kind: "product",
    topic: "원목 좌식 테이블 1200",
    brief: "월넛 원목 좌식 테이블 상세페이지. 수작업 마감, 관리법 포함.",
    keywords: ["원목 테이블", "좌식 테이블", "월넛"],
    tone: "professional",
    length: "medium",
    status: "review",
    created: -6,
    due: 1,
  },
  {
    client: "cleaner",
    kind: "product",
    topic: "주방 기름때 세정제 500ml",
    brief: "주방용 기름때 세정제 짧은 상품 설명. 재미있게, 과장 금지.",
    keywords: ["기름때 제거", "주방 세제", "친환경 세정제"],
    tone: "witty",
    length: "short",
    status: "review",
    created: -5,
    due: 0,
  },
  {
    client: "bakery",
    kind: "ad",
    topic: "추석 선물 세트 사전 예약",
    brief: "추석 빵 선물 세트 사전 예약 광고. 인스타그램과 네이버 검색광고용.",
    keywords: ["추석 선물", "빵 선물 세트", "사전 예약"],
    tone: "friendly",
    length: "medium",
    status: "writing",
    created: -7,
    due: -1,
  },
  {
    client: "clinic",
    kind: "blog",
    topic: "수험생 집중력 관리, 한방 차 이야기",
    brief: "수험생 학부모 대상. 효능을 단정하지 말고 생활 습관과 함께 소개.",
    keywords: ["수험생", "집중력", "한방차"],
    tone: "friendly",
    length: "medium",
    status: "writing",
    created: -3,
    due: 3,
  },
  {
    client: "skinLab",
    kind: "ad",
    topic: "비건 선크림 리뉴얼 런칭",
    brief: "리뉴얼 선크림 런칭 광고 문구. 비건 인증은 상세페이지 확인 후 표기.",
    keywords: ["비건 선크림", "선크림 추천", "리뉴얼"],
    tone: "professional",
    length: "medium",
    status: "writing",
    created: -2,
    due: 4,
  },
  {
    client: "academy",
    kind: "blog",
    topic: "초등 영어 원서 읽기, 어떻게 시작할까",
    brief: "학부모 대상 원서 읽기 가이드. 레벨별 추천 방식, 학원 수업 소개는 짧게.",
    keywords: ["원서 읽기", "초등 영어", "영어 독서"],
    tone: "friendly",
    length: "long",
    status: "received",
    created: -1,
    due: 6,
  },
  {
    client: "petSalon",
    kind: "ad",
    topic: "신규 고객 첫 미용 이벤트",
    brief: "첫 방문 고객 대상 미용 이벤트 문구. 할인율은 확정 전이라 비워 두기.",
    keywords: ["강아지 미용", "첫 방문 이벤트", "펫살롱"],
    tone: "witty",
    length: "short",
    status: "received",
    created: 0,
    due: 5,
  },
  {
    client: "appliance",
    kind: "blog",
    topic: "겨울철 가습기 세척, 이렇게 하세요",
    brief: "가습기 세척 방법 정보성 글. 자사 제품 언급은 한 문단 이내.",
    keywords: ["가습기 세척", "겨울 가습기", "가습기 관리"],
    tone: "friendly",
    length: "medium",
    status: "received",
    created: 0,
    due: 9,
  },
];

export interface SeedCase {
  industry: Industry;
  kind: ContentKind;
  title: string;
  clientLabel: string;
  summary: string;
  excerpt: string;
  /** Days relative to today. */
  published: number;
}

/** Sample cases for the 사례 board (the legacy POC's portfolio, without its invented results). */
export const SEED_CASES: SeedCase[] = [
  {
    industry: "IT/테크",
    kind: "blog",
    title: "디지털 마케팅 전략 가이드",
    clientLabel: "B2B 소프트웨어 스타트업",
    summary: "디지털 마케팅의 흐름을 실무 순서대로 풀어낸 블로그 연재를 기획하고 썼어요.",
    excerpt: "마케팅 예산이 적을수록 채널을 늘리기보다 하나의 채널에서 끝까지 해 보는 편이 낫습니다.",
    published: -60,
  },
  {
    industry: "헬스케어",
    kind: "blog",
    title: "건강식품 고르는 기준 정리",
    clientLabel: "건강기능식품 브랜드",
    summary: "건강식품을 고르는 기준을 소비자 눈높이로 정리한 정보성 포스트예요.",
    excerpt: "라벨에서 먼저 볼 것은 광고 문구가 아니라 원료 함량과 섭취 방법입니다.",
    published: -54,
  },
  {
    industry: "뷰티",
    kind: "product",
    title: "스킨케어 상세페이지 리뉴얼",
    clientLabel: "비건 스킨케어 브랜드",
    summary: "성분 이야기를 중심으로 상세페이지 문구를 처음부터 다시 썼어요.",
    excerpt: "바르는 순간보다 바른 뒤 한 시간이 더 중요합니다. 그 한 시간을 위해 성분을 덜어냈습니다.",
    published: -47,
  },
  {
    industry: "가전",
    kind: "product",
    title: "소형 가전 상품 설명 시리즈",
    clientLabel: "생활 가전 온라인몰",
    summary: "기술 사양을 생활 언어로 풀어 쓴 상품 설명 시리즈예요.",
    excerpt: "소음 32dB이라는 숫자 대신, 잠든 아이 옆에서도 켜 둘 수 있다고 말합니다.",
    published: -40,
  },
  {
    industry: "IT/테크",
    kind: "ad",
    title: "앱 런칭 캠페인 카피",
    clientLabel: "모바일 앱 스타트업",
    summary: "SNS·검색광고 문구를 하나의 메시지로 묶은 런칭 카피 세트예요.",
    excerpt: "할 일은 늘고 시간은 그대로. 오늘부터 하루가 조금 가벼워집니다.",
    published: -33,
  },
  {
    industry: "F&B",
    kind: "ad",
    title: "동네 매장 홍보 문구",
    clientLabel: "동네 분식집",
    summary: "매장 앞 현수막과 전단, 지도 앱 소개글에 쓸 문구를 한 번에 썼어요.",
    excerpt: "골목 끝 떡볶이집, 오늘도 오후 네 시에 새로 끓입니다.",
    published: -26,
  },
  {
    industry: "제조",
    kind: "blog",
    title: "중소 제조기업 ESG 실무 가이드",
    clientLabel: "금속 가공 제조사",
    summary: "작은 제조기업이 ESG를 시작하는 순서를 사례 중심으로 풀어낸 연재예요.",
    excerpt: "ESG 보고서보다 먼저 할 일은 공장 전기 사용량을 달마다 적는 일입니다.",
    published: -19,
  },
  {
    industry: "펫",
    kind: "product",
    title: "반려동물 용품 상세 문구 리뉴얼",
    clientLabel: "펫용품 쇼핑몰",
    summary: "반려동물 용품 쇼핑몰의 상세페이지 문구를 보호자 시선으로 다시 썼어요.",
    excerpt: "산책 후 발을 닦는 30초, 그 시간을 덜 버겁게 만드는 수건입니다.",
    published: -12,
  },
  {
    industry: "교육",
    kind: "ad",
    title: "학습 플랫폼 무료 체험 모집",
    clientLabel: "온라인 학습 플랫폼",
    summary: "학부모를 겨냥한 무료 체험 신청 광고 문구예요.",
    excerpt: "숙제 검사 대신 대화를. 아이가 오늘 배운 것을 먼저 이야기하게 됩니다.",
    published: -6,
  },
];

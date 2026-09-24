import { ArrowDown, ArrowUpRight } from "lucide-react";
import { formatWon } from "@/core/format";
import { PLAN_CATEGORIES, PLAN_CATEGORY_LABEL } from "../../domain/labels";
import type { PublicProfile as PublicProfileData } from "../../server/data/public";
import { WorkCalendar } from "../calendar/WorkCalendar";
import { PaperRoot } from "../ModuleRoot";
import { buttonClass } from "../ui/button";
import ui from "../ui/ui.module.css";
import { InquiryForm } from "./InquiryForm";
import styles from "./PublicProfile.module.css";

/**
 * The page a prospective client sees: who the developer is, half a year of steady work as squares,
 * finished projects, the price list and a quote request that lands on the developer's board.
 */
export function PublicProfile({ data }: { data: PublicProfileData }) {
  const { profile, portfolio, plans, calendar } = data;
  const activeWeeks = calendar.weeks.filter((week) => week.days.some((day) => day.minutes > 0)).length;
  return (
    <PaperRoot>
      <div className={styles.page}>
        <header className={styles.bar}>
          <span className={styles.brand}>
            <span className={styles.mark} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            {profile.businessName || profile.displayName}
          </span>
          <span className={styles.sample}>샘플 프로필</span>
          <nav aria-label="페이지 안 이동" className={styles.barNav}>
            <a href="#work">작업</a>
            <a href="#pricing">요금</a>
            <a href="#contact" className={buttonClass("primary", { small: true })}>
              견적 문의
            </a>
          </nav>
        </header>

        <main>
          <section className={styles.hero} aria-labelledby="pp-name">
            <div className={styles.heroText}>
              <h1 id="pp-name" className={styles.name}>
                {profile.displayName}
              </h1>
              <p className={styles.headline}>{profile.headline || "웹·앱 개발 프리랜서"}</p>
              {profile.bio ? <p className={styles.bio}>{profile.bio}</p> : null}
              <div className={styles.heroActions}>
                <a href="#contact" className={buttonClass("primary")}>
                  견적 문의하기
                </a>
                <a href="#pricing" className={buttonClass("secondary")}>
                  요금 보기 <ArrowDown size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
            <figure className={styles.proof}>
              <WorkCalendar calendar={calendar} mode="public" label="최근 26주 작업한 날" compactWeeks={26} />
              <figcaption className={styles.proofCaption}>
                최근 26주 중 <strong>{activeWeeks}주</strong>, <strong>{calendar.activeDays}일</strong> 작업했어요. 칸 하나가 하루, 진할수록 오래 일한 날이에요.
              </figcaption>
            </figure>
          </section>

          <section id="work" className={styles.section} aria-labelledby="pp-work">
            <h2 id="pp-work" className={styles.sectionTitle}>
              작업
            </h2>
            {portfolio.length === 0 ? (
              <p className={styles.muted}>공개한 작업이 아직 없어요.</p>
            ) : (
              <ol role="list" className={styles.works}>
                {portfolio.map((item) => (
                  <li key={item.id} className={styles.work}>
                    <div className={styles.workSide}>
                      <p className={styles.workPeriod}>{item.period}</p>
                      <p className={styles.workRole}>{item.role}</p>
                    </div>
                    <div className={styles.workMain}>
                      <h3 className={styles.workTitle}>{item.title}</h3>
                      {item.summary ? <p>{item.summary}</p> : null}
                      {item.outcome ? (
                        <p className={styles.outcome}>
                          <strong>결과</strong> {item.outcome}
                        </p>
                      ) : null}
                      {item.stack.length > 0 ? (
                        <ul role="list" className={styles.stack} aria-label="기술 스택">
                          {item.stack.map((tech) => (
                            <li key={tech}>{tech}</li>
                          ))}
                        </ul>
                      ) : null}
                      {item.url ? (
                        <a href={item.url} className={ui.textLink} target="_blank" rel="noopener noreferrer">
                          결과물 보기 <ArrowUpRight size={13} aria-hidden="true" />
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section id="pricing" className={styles.section} aria-labelledby="pp-pricing">
            <h2 id="pp-pricing" className={styles.sectionTitle}>
              요금
            </h2>
            <p className={styles.sectionNote}>시작 가격이에요. 범위를 듣고 기능 단위 견적서로 정확한 금액을 드려요.</p>
            <div className={styles.priceSheet}>
              {PLAN_CATEGORIES.map((category) => {
                const list = plans.filter((plan) => plan.category === category);
                if (list.length === 0) return null;
                return (
                  <section key={category} className={styles.priceRow} aria-labelledby={`pp-cat-${category}`}>
                    <h3 id={`pp-cat-${category}`} className={styles.priceCategory}>
                      {PLAN_CATEGORY_LABEL[category]}
                    </h3>
                    <ul role="list" className={styles.tiers}>
                      {list.map((plan) => (
                        <li key={plan.id} className={styles.tier} data-featured={plan.featured ? "" : undefined}>
                          <p className={styles.tierName}>
                            {plan.name}
                            {plan.featured ? <span className={styles.featured}>추천 구성</span> : null}
                          </p>
                          <p className={styles.tierPrice}>
                            {formatWon(plan.price)}
                            <span>부터{plan.delivery ? ` · ${plan.delivery}` : ""}</span>
                          </p>
                          <ul role="list" className={styles.tierFeatures}>
                            {plan.features.map((feature) => (
                              <li key={feature}>{feature}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          </section>

          <section id="contact" className={`${styles.section} ${styles.contact}`} aria-labelledby="pp-contact">
            <div className={styles.contactText}>
              <h2 id="pp-contact" className={styles.sectionTitle}>
                견적 문의
              </h2>
              <p>요청 내용을 보고 기능별 시간과 금액을 나눈 견적서를 보내 드려요.</p>
              {profile.email ? (
                <p className={styles.muted}>
                  메일로 바로: <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </p>
              ) : null}
            </div>
            <InquiryForm />
          </section>
        </main>

        <footer className={styles.footer}>
          <p>이 페이지는 DevFlow 데모의 샘플 개발자 프로필이에요. 이름, 작업, 가격은 예시예요.</p>
          <p>
            <a href="/dev-freelancing">DevFlow 작업공간</a> · <a href="/">한국형 1인 SaaS 10선</a>
          </p>
        </footer>
      </div>
    </PaperRoot>
  );
}

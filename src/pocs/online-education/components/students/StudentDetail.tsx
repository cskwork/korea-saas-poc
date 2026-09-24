import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft, FileText } from "lucide-react";
import { formatDate, formatRelative, formatWon } from "@/core/format";
import type { StudentDetail as Detail } from "../../server/reads";
import { dayLabel } from "../../domain/calendar";
import { paceLabel } from "../../domain/study-plan";
import ui from "../ui/ui.module.css";
import { EnrollmentProgress } from "./EnrollmentProgress";
import { DeleteLearner, RefundButton } from "./StudentActions";
import styles from "./students.module.css";

const formatDateTimeShort = (date: Date) =>
  formatDate(date, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

export function StudentDetail({ detail, now }: { detail: Detail; now: Date }) {
  const { learner, enrollments, payments, totalPaid } = detail;
  return (
    <>
      <Link href="/online-education/students" className={ui.back}>
        <ArrowLeft size={15} aria-hidden />
        수강생 목록
      </Link>
      <header className={ui.pageHeader}>
        <div>
          <h1 className={ui.pageTitle}>{learner.name}</h1>
          <p className={ui.pageLede}>
            {learner.email} · {formatDate(learner.createdAt)} 가입 · 누적 결제 <span className={ui.num}>{formatWon(totalPaid)}</span>
          </p>
        </div>
      </header>

      <div className={ui.stack}>
        <section aria-labelledby="enrollments-title">
          <div className={ui.sectionHead}>
            <h2 id="enrollments-title" className={ui.sectionTitle}>
              수강 중인 강의
            </h2>
          </div>
          {enrollments.length === 0 ? (
            <p className={clsx(ui.notice, ui.info)}>수강 신청한 강의가 없어요. 디지털 상품만 구매했어요.</p>
          ) : (
            <ul role="list" className={styles.enrollmentCards}>
              {enrollments.map((enrollment) => (
                <li key={enrollment.id} className={styles.enrollmentCard} data-color={enrollment.color}>
                  <div className={styles.enrollmentHead}>
                    <span className={ui.courseChip}>
                      <span>{enrollment.courseTitle}</span>
                    </span>
                    <span className={styles.quiet}>{formatDate(enrollment.enrolledAt)} 신청</span>
                  </div>
                  <EnrollmentProgress progress={enrollment.progress} expected={enrollment.expected} pace={enrollment.pace} />
                  <dl className={styles.planFacts}>
                    <div>
                      <dt>내 시간표</dt>
                      <dd>{paceLabel(enrollment)}</dd>
                    </div>
                    <div>
                      <dt>완주 목표</dt>
                      <dd>{dayLabel(enrollment.planFinishOn)}</dd>
                    </div>
                    <div>
                      <dt>계획상 진도</dt>
                      <dd className={ui.num}>{Math.round(enrollment.expected * 100)}%</dd>
                    </div>
                    <div>
                      <dt>마지막 학습</dt>
                      <dd>{enrollment.lastStudiedAt ? formatRelative(enrollment.lastStudiedAt, now) : "아직 없어요"}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="payments-title">
          <div className={ui.sectionHead}>
            <h2 id="payments-title" className={ui.sectionTitle}>
              결제 내역
            </h2>
          </div>
          {payments.length === 0 ? (
            <p className={clsx(ui.notice, ui.info)}>결제 내역이 없어요.</p>
          ) : (
            <div className={ui.tableWrap}>
              <table className={ui.table}>
                <thead>
                  <tr>
                    <th scope="col">결제일</th>
                    <th scope="col">항목</th>
                    <th scope="col" className={ui.right}>
                      금액
                    </th>
                    <th scope="col">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className={clsx(ui.num, styles.date)}>{formatDateTimeShort(payment.paidAt)}</td>
                      <td>
                        {payment.kind === "product" ? (
                          <span className={ui.productChip}>
                            <FileText size={12} aria-hidden />
                            {payment.itemTitle}
                          </span>
                        ) : (
                          payment.itemTitle
                        )}
                      </td>
                      <td className={clsx(ui.right, ui.num, styles.strong)}>{formatWon(payment.amount)}</td>
                      <td>
                        {payment.status === "refunded" ? (
                          <span className={ui.badge} data-tone="danger">
                            환불 {payment.refundedAt ? formatDate(payment.refundedAt) : ""}
                          </span>
                        ) : (
                          <RefundButton paymentId={payment.id} kind={payment.kind} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <DeleteLearner id={learner.id} name={learner.name} />
      </div>
    </>
  );
}

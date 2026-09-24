import { ChevronDown, ExternalLink } from "lucide-react";
import { formatDate, formatNumber, formatPercent, formatWon } from "@/core/format";
import { CHANNEL_LABEL, CHANNEL_TAGS, LINK_STATUS_LABEL, type Channel } from "../../domain/catalog";
import { describeTerms } from "../../domain/commission";
import type { LinkReport } from "../../server/reports";
import type { ProgramRow } from "../../server/programs";
import { ColumnChart } from "../charts/ColumnChart";
import { clickColumns } from "../charts/series";
import { BarList } from "../charts/ShareBar";
import { ConversionForm } from "../conversions/ConversionForm";
import { ConversionTable } from "../conversions/ConversionTable";
import { displayUrl, readableUrl, shortUrl } from "../display";
import { ShelfLabel } from "../label/ShelfLabel";
import { ScanTape } from "../tape/ScanTape";
import { CopyButton } from "../ui/actions";
import { Band, Chip, Empty, Page, Section, ui } from "../ui/primitives";
import { DeleteLink, StatusSwitch } from "./LinkControls";
import { LinkForm } from "./LinkForm";
import { STATUS_TONE } from "./LinksScreen";
import styles from "./links.module.css";

const TAGGED: Channel[] = ["naver_blog", "tistory", "instagram", "threads", "x", "youtube", "kakao"];

export function LinkDetailScreen({
  report,
  programs,
  origin,
  today,
  created,
}: {
  report: LinkReport;
  programs: ProgramRow[];
  origin: string;
  today: string;
  created: boolean;
}) {
  const { link } = report;
  const url = shortUrl(origin, link.code);
  const chart = clickColumns(report.series, { today, markOrders: true });

  return (
    <>
      <Band title={link.productName} back={{ href: "/affiliate-marketing/links", label: "링크 진열대" }}>
        <div className={styles.detailBand}>
          <div className={styles.detailFacts}>
            <p className={styles.factLine}>
              <Chip tone={STATUS_TONE[link.status]}>{LINK_STATUS_LABEL[link.status]}</Chip>
              <span>{link.programName ?? "프로그램 미지정"}</span>
              <span>{link.category}</span>
              <span>{describeTerms(link)}</span>
              {link.priceWon != null ? <span>상품가 {formatWon(link.priceWon)}</span> : null}
            </p>
            <p className={styles.destination}>
              <span>이동 주소</span>
              <a href={link.destinationUrl} target="_blank" rel="noopener noreferrer nofollow">
                {readableUrl(link.destinationUrl)}
              </a>
              <ExternalLink aria-hidden width={14} height={14} />
            </p>
            <p className={styles.factLine}>
              {formatDate(link.createdAt)} 등록 · 확정 수수료 {formatWon(report.confirmed)} · 확정 대기 {formatWon(report.pending)}
            </p>
            {link.memo ? <p className={styles.factLine}>메모: {link.memo}</p> : null}
            <StatusSwitch id={link.id} status={link.status} />
          </div>
          <ShelfLabel
            hero
            promo
            fresh={created}
            priceCaption="누적 수익"
            data={{ ...link, clicks: report.lifetime.clicks, conversions: report.lifetime.conversions, revenue: report.lifetime.revenue, cvr: report.lifetime.cvr, epc: report.lifetime.epc }}
            url={url}
          />
        </div>
      </Band>

      <Page>
        {created ? (
          <p role="status" className={`${ui.noticeOk} ${ui.stamp}`}>
            링크를 등록했어요. 가격표의 바코드를 누르면 짧은 링크가 복사돼요. 글이나 SNS에 붙여 넣으면 클릭이 여기 기록돼요.
          </p>
        ) : null}

        <div className={styles.twoCol}>
          <div className={styles.stack}>
            <Section
              id="clicks"
              title="최근 30일 클릭"
              note={`클릭 ${formatNumber(report.last30.clicks)} · 판매 ${formatNumber(report.last30.conversions)} · 전환율 ${formatPercent(report.last30.cvr)} · 수익 ${formatWon(report.last30.revenue)}. 빨간 점은 판매가 있었던 날이에요.`}
            >
              <div className={ui.panelPad}>
                <ColumnChart title={`${link.productName} 최근 30일 일별 클릭`} {...chart} />
              </div>
            </Section>

            <Section
              id="orders"
              title="판매 기록"
              note="최근 10건"
              link={{ href: `/affiliate-marketing/conversions?linkId=${link.id}`, label: "이 링크의 기록 모두 보기" }}
            >
              {report.orders.length > 0 ? (
                <ConversionTable rows={report.orders} showProduct={false} caption={`${link.productName} 판매 기록`} />
              ) : (
                <Empty title="아직 판매 기록이 없어요">주문이 확인되면 아래에서 기록하세요. 수수료는 이 링크의 조건으로 자동 계산돼요.</Empty>
              )}
              <div className={styles.formPanel}>
                <ConversionForm
                  fixedLinkId={link.id}
                  today={today}
                  title="이 링크의 판매 기록하기"
                  options={[{ ...link, programName: link.programName }]}
                />
              </div>
            </Section>
          </div>

          <div className={styles.stack}>
            <Section id="channels" title="채널별 짧은 링크" note="붙일 곳에 맞는 링크를 쓰면 리퍼러가 없어도 채널이 정확히 집계돼요.">
              <ul className={styles.channelLinks} role="list">
                <li className={styles.channelLink}>
                  <span className={styles.channelName}>기본</span>
                  <span className={styles.channelUrl}>{displayUrl(url)}</span>
                  <CopyButton text={url} label="복사" />
                </li>
                {TAGGED.map((channel) => {
                  const tagged = shortUrl(origin, link.code, CHANNEL_TAGS[channel]);
                  return (
                    <li key={channel} className={styles.channelLink}>
                      <span className={styles.channelName}>{CHANNEL_LABEL[channel]}</span>
                      <span className={styles.channelUrl}>{displayUrl(tagged)}</span>
                      <CopyButton text={tagged} label="복사" />
                    </li>
                  );
                })}
              </ul>
            </Section>

            <Section id="by-channel" title="채널별 클릭 (30일)">
              {report.byChannel.length > 0 ? (
                <div className={ui.panelPad}>
                  <BarList
                    label="채널별 클릭"
                    items={report.byChannel.map((row) => ({
                      key: row.key,
                      label: CHANNEL_LABEL[row.key],
                      value: row.clicks,
                      valueLabel: formatNumber(row.clicks),
                      note: row.conversions > 0 ? `판매 ${row.conversions}` : undefined,
                    }))}
                  />
                </div>
              ) : (
                <Empty title="최근 30일 클릭이 없어요">짧은 링크를 글이나 SNS에 붙이면 채널별로 나뉘어 보여요.</Empty>
              )}
            </Section>

            <Section id="scans" title="스캔 기록">
              <ScanTape clicks={report.recent} showProduct={false} showDate empty="아직 클릭이 없어요. 짧은 링크를 직접 눌러 보면 바로 찍혀요." />
            </Section>
          </div>
        </div>

        <details className={styles.editBox}>
          <summary>
            링크 정보 수정
            <ChevronDown aria-hidden />
          </summary>
          <div className={styles.editBody}>
            <LinkForm
              programs={programs}
              initial={{
                id: link.id,
                productName: link.productName,
                programId: link.programId,
                category: link.category,
                destinationUrl: link.destinationUrl,
                priceWon: link.priceWon,
                commissionType: link.commissionType,
                commissionRateBp: link.commissionRateBp,
                commissionFixedWon: link.commissionFixedWon,
                memo: link.memo,
                status: link.status,
              }}
            />
          </div>
        </details>

        <div className={styles.danger}>
          <p>링크를 삭제하면 짧은 링크가 더 이상 작동하지 않고, 이 링크의 클릭과 판매 기록도 함께 지워져요. 판매만 멈추려면 상태를 &lsquo;판매 종료&rsquo;로 바꾸세요.</p>
          <DeleteLink id={link.id} name={link.productName} />
        </div>
      </Page>
    </>
  );
}

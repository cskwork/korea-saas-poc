import { ArrowLeft, FilePlus2, Mail, Phone, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDate, formatWon } from "@/core/format";
import { shortDay } from "../../domain/dates";
import { CLIENT_GRADE_LABEL, NOTE_KIND_LABEL, PROJECT_STATUS_LABEL } from "../../domain/labels";
import { deleteClient, deleteClientNote } from "../../server/actions";
import type { ClientDetail as ClientDetailData } from "../../server/data/clients";
import { DocumentRows } from "../documents/DocumentRows";
import { projectCell } from "../documents/status";
import { ActionButton } from "../ui/ActionButton";
import { buttonClass } from "../ui/button";
import { Cell, StateLabel } from "../ui/Cells";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import ui from "../ui/ui.module.css";
import { ClientEditor } from "./ClientEditors";
import { NoteForm } from "./NoteForm";
import styles from "./Clients.module.css";

export function ClientDetail({ data, today }: { data: ClientDetailData; today: string }) {
  const { client } = data;
  return (
    <div className={styles.detail}>
      <Link href="/dev-freelancing/clients" className={ui.textLink}>
        <ArrowLeft size={14} aria-hidden="true" /> 고객 목록
      </Link>
      <PageHeader
        title={client.company ? `${client.name} · ${client.company}` : client.name}
        description={
          <span className={styles.contact}>
            <span className={ui.tag} data-tone={client.grade === "vip" ? "accent" : undefined}>
              {CLIENT_GRADE_LABEL[client.grade]}
            </span>
            {client.email ? (
              <a href={`mailto:${client.email}`} className={ui.textLink}>
                <Mail size={13} aria-hidden="true" />
                {client.email}
              </a>
            ) : null}
            {client.phone ? (
              <a href={`tel:${client.phone}`} className={ui.textLink}>
                <Phone size={13} aria-hidden="true" />
                {client.phone}
              </a>
            ) : null}
          </span>
        }
        actions={
          <>
            <Link href={`/dev-freelancing/estimates/new?client=${client.id}`} className={buttonClass("secondary", { small: true })}>
              <FilePlus2 size={14} aria-hidden="true" />새 견적서
            </Link>
            <ActionButton action={deleteClient} payload={{ id: client.id }} variant="danger" small confirm="고객과 기록을 지울까요? 프로젝트와 문서는 남아요." confirmLabel="삭제">
              <Trash2 size={14} aria-hidden="true" />
              삭제
            </ActionButton>
          </>
        }
      />
      <ClientEditor client={{ id: client.id, name: client.name, company: client.company, email: client.email, phone: client.phone, grade: client.grade, notes: client.notes }} />

      <dl className={styles.facts}>
        <div>
          <dt>누적 입금</dt>
          <dd>{formatWon(client.paid)}</dd>
        </div>
        <div>
          <dt>받을 돈</dt>
          <dd>{client.outstanding > 0 ? formatWon(client.outstanding) : "없음"}</dd>
        </div>
        <div>
          <dt>프로젝트</dt>
          <dd>
            {client.projectCount}건 {client.activeProjects > 0 ? `· 진행 ${client.activeProjects}` : ""}
          </dd>
        </div>
        <div>
          <dt>처음 등록</dt>
          <dd>{formatDate(client.createdAt)}</dd>
        </div>
      </dl>

      {client.notes ? <p className={styles.notes}>{client.notes}</p> : null}

      <div className={styles.split}>
        <section className={ui.region} aria-labelledby="cd-history">
          <div className={ui.regionHead}>
            <h2 id="cd-history" className={ui.regionTitle}>
              거래 이력
            </h2>
            <p className={ui.regionNote}>문의, 견적, 입금, 통화까지 시간순으로</p>
          </div>
          {data.history.length === 0 ? (
            <EmptyState title="아직 이력이 없어요">견적서를 보내거나 통화 기록을 남기면 여기에 쌓여요.</EmptyState>
          ) : (
            <ol role="list" className={styles.history}>
              {data.history.map((event) => (
                <li key={event.key} className={styles.event}>
                  <span className={`${ui.measure} ${styles.eventDay}`}>{shortDay(event.day)}</span>
                  <Cell state={event.state} size={10} />
                  <div className={styles.eventWhat}>
                    <span className={styles.eventLabel}>{event.label}</span>
                    {event.href ? (
                      <Link href={event.href} className={styles.eventTitle}>
                        {event.title}
                      </Link>
                    ) : (
                      <span className={styles.eventTitle}>{event.title}</span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className={ui.region} aria-labelledby="cd-notes">
          <div className={ui.regionHead}>
            <h2 id="cd-notes" className={ui.regionTitle}>
              연락 기록
            </h2>
          </div>
          <div className={styles.noteForm}>
            <NoteForm clientId={client.id} today={today} />
          </div>
          {data.notes.length > 0 ? (
            <ul role="list" className={styles.noteList}>
              {data.notes.map((note) => (
                <li key={note.id} className={styles.note}>
                  <div>
                    <p className={styles.noteMeta}>
                      {NOTE_KIND_LABEL[note.kind]} · {shortDay(note.occurredOn)}
                    </p>
                    <p>{note.body}</p>
                  </div>
                  <ActionButton action={deleteClientNote} payload={{ id: note.id }} small iconOnly variant="ghost" label="기록 삭제" confirm="지울까요?" confirmLabel="삭제">
                    <Trash2 size={14} aria-hidden="true" />
                  </ActionButton>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      <section className={ui.region} aria-labelledby="cd-projects">
        <div className={ui.regionHead}>
          <h2 id="cd-projects" className={ui.regionTitle}>
            프로젝트
          </h2>
        </div>
        {data.projects.length === 0 ? (
          <EmptyState title="연결된 프로젝트가 없어요">견적서에서 프로젝트를 만들거나, 보드에서 이 고객으로 새 프로젝트를 추가하세요.</EmptyState>
        ) : (
          <ul role="list" className={styles.projectList}>
            {data.projects.map((project) => (
              <li key={project.id}>
                <Link href={`/dev-freelancing/projects/${project.id}`} className={ui.rowLink}>
                  {project.title}
                </Link>
                <StateLabel state={projectCell(project.status)}>{PROJECT_STATUS_LABEL[project.status]}</StateLabel>
                <span className={ui.num}>{project.budget > 0 ? formatWon(project.budget) : "예산 미정"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.estimates.length + data.invoices.length > 0 ? (
        <section className={ui.region} aria-labelledby="cd-docs">
          <h2 id="cd-docs" className={ui.regionTitle}>
            견적서 · 인보이스
          </h2>
          <DocumentRows estimates={data.estimates} invoices={data.invoices} today={today} />
        </section>
      ) : null}
    </div>
  );
}

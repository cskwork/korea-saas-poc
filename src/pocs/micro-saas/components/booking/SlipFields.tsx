"use client";

import { useEffect, useId, useState } from "react";
import type { ActionState } from "@/core/actions";
import { formatWon } from "@/core/format";
import type { SlotResponse } from "../../server/queries";
import { formatMinute, parseTime, slotStarts } from "../../domain/time";
import { Field } from "../world/Field";
import { errorProps, fieldError } from "../world/forms";
import ui from "../world/ui.module.css";
import styles from "./slip.module.css";

export interface SlipService {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  active: boolean;
}

export interface SlipHours {
  openMinute: number;
  closeMinute: number;
}

/** Slot occupancy for the chosen day and service, fetched as the owner fills the slip. */
function useSlots(date: string, serviceId: string, excludeId?: string): SlotResponse | null {
  const key = `${date}|${serviceId}|${excludeId ?? ""}`;
  const [loaded, setLoaded] = useState<{ key: string; data: SlotResponse } | null>(null);
  useEffect(() => {
    if (!date || !serviceId) return;
    const params = new URLSearchParams({ date, serviceId });
    if (excludeId) params.set("exclude", excludeId);
    const controller = new AbortController();
    fetch(`/micro-saas/api/slots?${params}`, { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<SlotResponse>) : null))
      .then((data) => {
        if (data) setLoaded({ key: `${date}|${serviceId}|${excludeId ?? ""}`, data });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [date, serviceId, excludeId]);
  return loaded?.key === key ? loaded.data : null;
}

const SUFFIX = { full: " · 마감", overrun: " · 영업 종료 넘김", past: "", open: "" } as const;

/**
 * Date, time and service cells of the booking slip, with the day's real occupancy: full slots
 * are marked in the time list and a knowing override ('겹쳐도 저장') appears only when needed.
 */
export function SlipWhen({
  state,
  services,
  hours,
  initial,
  booked,
}: {
  state: ActionState<unknown>;
  services: SlipService[];
  hours: SlipHours;
  initial: { date: string; time: string; serviceId: string };
  /** Edit mode: the booking being moved (left out of occupancy) and its service, kept while the select stays blank. */
  booked?: { id: string; serviceId: string | null; serviceName: string };
}) {
  const id = useId();
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [serviceId, setServiceId] = useState(initial.serviceId);
  const effectiveService = serviceId || booked?.serviceId || "";
  const slots = useSlots(date, services.some((s) => s.id === effectiveService) ? effectiveService : "", booked?.id);

  const minutes = slots?.slots.map((s) => s.minute) ?? slotStarts(hours.openMinute, hours.closeMinute);
  const timeMinute = time ? parseTime(time) : null;
  const times =
    timeMinute !== null && !minutes.includes(timeMinute) ? [...minutes, timeMinute].sort((a, b) => a - b) : minutes;
  const chosen = slots?.slots.find((s) => formatMinute(s.minute) === time);
  const warning = !slots
    ? null
    : slots.closedDay
      ? "이 날은 휴무일이에요."
      : chosen?.state === "full"
        ? `${time}에는 이미 예약 ${chosen.taken}건이 있어 좌석 ${slots.seats}개가 모두 찼어요.`
        : chosen?.state === "overrun"
          ? "이 서비스는 영업시간 안에 끝나지 않아요."
          : time && !chosen
            ? "영업시간 밖의 시간이에요."
            : null;
  const serverSlotError = state.status === "error" && state.message.includes("겹쳐도 저장");

  return (
    <>
      <div className={ui.pair}>
        <Field id={`${id}-date`} label="날짜" stack error={fieldError(state, "date")}>
          <input
            id={`${id}-date`}
            name="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            {...errorProps(state, "date", `${id}-date`)}
          />
        </Field>
        <Field id={`${id}-time`} label="시간" stack error={fieldError(state, "time")}>
          <select
            id={`${id}-time`}
            name="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            {...errorProps(state, "time", `${id}-time`)}
          >
            <option value="">시간 선택</option>
            {times.map((minute) => {
              const slot = slots?.slots.find((s) => s.minute === minute);
              return (
                <option key={minute} value={formatMinute(minute)}>
                  {formatMinute(minute)}
                  {slot ? SUFFIX[slot.state] : ""}
                </option>
              );
            })}
          </select>
        </Field>
      </div>
      <Field id={`${id}-service`} label="서비스" error={fieldError(state, "serviceId")}>
        <select
          id={`${id}-service`}
          name="serviceId"
          required={!booked}
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          {...errorProps(state, "serviceId", `${id}-service`)}
        >
          <option value="">{booked ? `${booked.serviceName} (그대로)` : "서비스 선택"}</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.durationMinutes}분 · {formatWon(s.price)}
              {s.active ? "" : " (예약 페이지 숨김)"}
            </option>
          ))}
        </select>
      </Field>
      {warning || serverSlotError ? (
        <div className={styles.overlap}>
          <p className={ui.warn} role="status">
            {warning ?? "고른 시간에 겹치는 예약이 있어요."} 그래도 적으려면 아래를 선택하세요.
          </p>
          <label className={ui.check}>
            <input type="checkbox" name="allowOverlap" />
            겹쳐도 저장
          </label>
        </div>
      ) : null}
    </>
  );
}

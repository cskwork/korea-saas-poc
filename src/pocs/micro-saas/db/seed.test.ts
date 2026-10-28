import { describe, expect, it } from "vitest";
import { addDays } from "../domain/time";
import { buildSeedRows } from "./seed";

describe("micro-saas sample book", () => {
  it("shows today's planned cancellation and waiting bookings on every date of a year", () => {
    // The seeded random stream depends on the calendar, so a cancelled booking must not need a free seat.
    for (let offset = 0; offset < 366; offset++) {
      const date = addDays("2026-01-01", offset);
      const todays = buildSeedRows("ws", { date, minute: 0 }).bookings.filter((b) => b.date === date);
      expect(todays.some((b) => b.status === "cancelled"), date).toBe(true);
      expect(todays.some((b) => b.status === "pending"), date).toBe(true);
    }
  });
});

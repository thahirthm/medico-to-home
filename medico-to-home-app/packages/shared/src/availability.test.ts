import { describe, expect, it } from "vitest";
import { hasTimetable, hoursText, isOpen, SLOT_TIMES, timetableSummary, weekdayOf, weeklySlotCount } from "./availability";

describe("timetable", () => {
  it("offers hourly slots from 7 AM to 8 PM", () => {
    expect(SLOT_TIMES[0]).toBe("7:00 AM");
    expect(SLOT_TIMES.at(-1)).toBe("8:00 PM");
    expect(SLOT_TIMES).toHaveLength(14);
  });

  it("reads the weekday of a date key", () => {
    expect(weekdayOf("2026-11-5")).toBe("Thu");
    expect(weekdayOf("2026-11-8")).toBe("Sun");
  });

  it("is open only at the hours set for that weekday", () => {
    const t = { weekly: { Thu: ["9:00 AM", "4:00 PM"] }, allDay: false };
    expect(isOpen(t, "2026-11-5", "9:00 AM")).toBe(true);
    expect(isOpen(t, "2026-11-5", "10:00 AM")).toBe(false);
    expect(isOpen(t, "2026-11-6", "9:00 AM")).toBe(false);
    expect(isOpen({ weekly: {}, allDay: true }, "2026-11-6", "8:00 PM")).toBe(true);
  });

  it("writes hours as ranges that end when the last hour ends", () => {
    expect(hoursText(["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"])).toBe("9 AM–1 PM");
    expect(hoursText(["5:00 PM", "6:00 PM", "8:00 AM"])).toBe("8–9 AM, 5–7 PM");
  });

  it("groups days that share the same hours", () => {
    const evenings = ["5:00 PM", "6:00 PM"];
    const t = { weekly: { Mon: evenings, Tue: evenings, Wed: evenings, Sat: ["9:00 AM"], Sun: [] }, allDay: false };
    expect(timetableSummary(t)).toEqual(["Mon–Wed · 5–7 PM", "Sat · 9–10 AM"]);
    expect(weeklySlotCount(t)).toBe(7);
    expect(hasTimetable({ weekly: { Sat: [] } })).toBe(false);
  });
});

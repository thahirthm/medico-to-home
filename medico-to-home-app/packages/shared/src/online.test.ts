import { describe, expect, it } from "vitest";
import { callIsOpen, canConsultOnline, offeredServices, onlineConsultPrice, onlineServices } from "./online";

describe("online consultations", () => {
  it("are offered only by categories that can see patients over video", () => {
    expect(canConsultOnline("doctor")).toBe(true);
    expect(canConsultOnline("psych")).toBe(true);
    expect(canConsultOnline("nurse")).toBe(false);
    expect(canConsultOnline("ambulance")).toBe(false);
  });

  it("cost less than a home visit, with a floor", () => {
    expect(onlineConsultPrice(600)).toBe(420);
    expect(onlineConsultPrice(180)).toBe(200);
  });

  it("drop the online flag for categories that cannot consult online", () => {
    const svcs = [{ name: "Injection", price: 230, duration: "15 min", online: true }];
    expect(onlineServices("nurse", svcs)[0]!.online).toBe(false);
    expect(onlineServices("doctor", svcs)[0]!.online).toBe(true);
  });

  it("open a call 10 minutes early and close it an hour after the slot", () => {
    const start = new Date("2026-11-05T10:00:00Z"), end = new Date("2026-11-05T10:20:00Z");
    expect(callIsOpen(start, end, new Date("2026-11-05T09:49:00Z"))).toBe(false);
    expect(callIsOpen(start, end, new Date("2026-11-05T09:51:00Z"))).toBe(true);
    expect(callIsOpen(start, end, new Date("2026-11-05T11:19:00Z"))).toBe(true);
    expect(callIsOpen(start, end, new Date("2026-11-05T11:21:00Z"))).toBe(false);
  });

  it("are added for professionals who have not chosen, and left alone once they have", () => {
    const visit = { name: "Home visit", price: 600, duration: "30 min" };
    expect(offeredServices("doctor", 600, [visit], []).map((s) => s.name)).toEqual(["Home visit", "Online consultation"]);
    expect(offeredServices("doctor", 600, [{ ...visit, online: false }], []).map((s) => s.name)).toEqual(["Home visit"]);
    expect(offeredServices("nurse", 500, [visit], []).map((s) => s.name)).toEqual(["Home visit"]);
    expect(offeredServices("psych", 1200, [], [visit]).at(-1)!.online).toBe(true);
  });
});

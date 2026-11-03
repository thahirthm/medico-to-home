import { describe, expect, it } from "vitest";
import { carePlanDayPrice, planDiscountRate, quote, servicePrice } from "./pricing";

describe("servicePrice", () => {
  it("rounds to the nearest ₹10", () => {
    expect(servicePrice(600, 1.1)).toBe(660);
    expect(servicePrice(450, 0.5)).toBe(230);
  });
});

describe("carePlanDayPrice", () => {
  it("applies the hours factor", () => {
    expect(carePlanDayPrice(1200, 4)).toBe(540);
    expect(carePlanDayPrice(1200, 24)).toBe(2160);
  });
});

describe("planDiscountRate", () => {
  it("steps at 10 and 20 sessions", () => {
    expect(planDiscountRate(9)).toBe(0);
    expect(planDiscountRate(10)).toBe(0.1);
    expect(planDiscountRate(20)).toBe(0.15);
  });
});

describe("quote", () => {
  it("matches a single visit in the prototype", () => {
    expect(quote(800, 1, false).total).toBe(858);
  });

  it("matches a 10-session plan", () => {
    const q = quote(600, 10, true);
    expect(q.discount).toBe(600);
    expect(q.gst).toBe(9);
    expect(q.total).toBe(5458);
  });

  it("never discounts a single visit, even with many units", () => {
    expect(quote(600, 10, false).discount).toBe(0);
  });
});

export const PLATFORM_FEE = 49;
export const GST_RATE = 0.18;

export const CARE_HOUR_FACTORS = { 4: 0.45, 8: 0.75, 12: 1, 24: 1.8 } as const;
export type CareHours = keyof typeof CARE_HOUR_FACTORS;

export const roundToTen = (amount: number) => Math.round(amount / 10) * 10;

/** Professional's base price × service multiplier, rounded to ₹10. */
export function servicePrice(basePrice: number, multiplier: number): number {
  return roundToTen(basePrice * multiplier);
}

/** Price of one day of a care plan at the given hours per day. */
export function carePlanDayPrice(price: number, hours: CareHours): number {
  return roundToTen(price * CARE_HOUR_FACTORS[hours]);
}

/** 10% from 10 sessions, 15% from 20. Single visits get no discount. */
export function planDiscountRate(sessions: number): number {
  if (sessions >= 20) return 0.15;
  if (sessions >= 10) return 0.1;
  return 0;
}

export interface Quote {
  unitPrice: number;
  sessions: number;
  subtotal: number;
  discountRate: number;
  discount: number;
  platformFee: number;
  gst: number;
  total: number;
}

export function quote(unitPrice: number, sessions: number, isPlan: boolean): Quote {
  const subtotal = unitPrice * sessions;
  const discountRate = isPlan ? planDiscountRate(sessions) : 0;
  const discount = Math.round(subtotal * discountRate);
  const gst = Math.round(PLATFORM_FEE * GST_RATE);
  return {
    unitPrice,
    sessions,
    subtotal,
    discountRate,
    discount,
    platformFee: PLATFORM_FEE,
    gst,
    total: subtotal - discount + PLATFORM_FEE + gst,
  };
}

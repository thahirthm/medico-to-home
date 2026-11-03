const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export const SLOTS = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:30 PM", "2:00 PM", "3:30 PM", "4:30 PM", "5:00 PM", "6:00 PM", "7:30 PM"];

/** "2026-10-31" + "5:00 PM" in India time. */
export function istDate(date: string, slot: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const match = /^(\d+):(\d+) (AM|PM)$/.exec(slot);
  if (!match || !y || !m || !d) throw new Error("Invalid date or slot");
  const hour = (Number(match[1]) % 12) + (match[3] === "PM" ? 12 : 0);
  return new Date(Date.UTC(y, m - 1, d, hour, Number(match[2])) - IST_OFFSET_MS);
}

export function startOfIstDay(now = new Date()): Date {
  const shifted = now.getTime() + IST_OFFSET_MS;
  return new Date(shifted - (shifted % 86_400_000) - IST_OFFSET_MS);
}

/** Monday 00:00 India time for the week containing `now`. */
export function startOfIstWeek(now = new Date()): Date {
  const day = startOfIstDay(now);
  const weekday = new Date(day.getTime() + IST_OFFSET_MS).getUTCDay();
  return new Date(day.getTime() - ((weekday + 6) % 7) * 86_400_000);
}

export const formatIst = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...options }).format(date);

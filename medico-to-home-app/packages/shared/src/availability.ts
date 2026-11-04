// A Medico's weekly timetable and their own services and charges.
// The times are the hourly booking slots families pick from, so a timetable maps straight onto bookings.

const hour = (h: number) => `${h % 12 || 12}:00 ${h < 12 ? "AM" : "PM"}`;
const hours = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => hour(from + i));

/** Hourly booking slots, 7 AM to 8 PM. Each slot is the hour a visit starts. */
export const DAY_PARTS = [
  { label: "Morning", times: hours(7, 11) },
  { label: "Afternoon", times: hours(12, 15) },
  { label: "Evening", times: hours(16, 20) },
] as const;

export const SLOT_TIMES: string[] = DAY_PARTS.flatMap((p) => [...p.times]);

/** "9:00 AM" → "9 AM". */
export const shortTime = (t: string) => t.replace(":00", "");

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** The slot times open on each weekday. A day that is missing or empty is a day off. */
export type Weekly = Partial<Record<Weekday, string[]>>;

export interface Timetable {
  weekly: Weekly;
  /** Round the clock, every day: 24×7 care and ambulances. */
  allDay: boolean;
}

/** Sorts times into the order of the day, and drops anything that is not a slot. */
export const inDayOrder = (times: string[]) => SLOT_TIMES.filter((t) => times.includes(t));

export const hasTimetable = (t: Partial<Timetable>) => !!t.allDay || Object.values(t.weekly ?? {}).some((times) => times?.length);

/** "Mon" for a "2026-11-5" date key. */
export function weekdayOf(dateKey: string): Weekday {
  const [y = 0, m = 1, d = 1] = dateKey.split("-").map(Number);
  return WEEKDAYS[(new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7]!;
}

/** Whether a timetable is open at a slot on a date. */
export const isOpen = (t: Partial<Timetable>, dateKey: string, slot: string) => !!t.allDay || !!t.weekly?.[weekdayOf(dateKey)]?.includes(slot);

// Runs of neighbours in a list, e.g. indexes [0,1,2,4] → [[0,2],[4,4]].
function runs(indexes: number[]): [number, number][] {
  const out: [number, number][] = [];
  for (const i of indexes) {
    const last = out.at(-1);
    if (last && last[1] === i - 1) last[1] = i;
    else out.push([i, i]);
  }
  return out;
}

/** "9 AM–1 PM, 5–7 PM": each run of hours, ending when the last hour ends. */
export function hoursText(times: string[]): string {
  return runs(inDayOrder(times).map((t) => SLOT_TIMES.indexOf(t)))
    .map(([a, b]) => {
      const start = SLOT_TIMES[a]!, end = hour(7 + b + 1);
      const [s, sm] = shortTime(start).split(" "), [e, em] = shortTime(end).split(" ");
      return sm === em ? `${s}–${e} ${em}` : `${s} ${sm}–${e} ${em}`;
    })
    .join(", ");
}

/** "Mon–Fri · 9 AM–1 PM", one line for each set of days with the same hours. */
export function timetableSummary(t: Partial<Timetable>): string[] {
  if (t.allDay) return ["Every day · 24×7"];
  const groups = new Map<string, number[]>();
  WEEKDAYS.forEach((d, i) => {
    const text = hoursText(t.weekly?.[d] ?? []);
    if (text) groups.set(text, [...(groups.get(text) ?? []), i]);
  });
  return [...groups].map(([text, idx]) => {
    const days = runs(idx).map(([a, b]) => (a === b ? WEEKDAYS[a] : b - a === 1 ? `${WEEKDAYS[a]}, ${WEEKDAYS[b]}` : `${WEEKDAYS[a]}–${WEEKDAYS[b]}`));
    return `${idx.length === 7 ? "Every day" : days.join(", ")} · ${text}`;
  });
}

export const weeklySlotCount = (t: Partial<Timetable>) => (t.allDay ? 7 * SLOT_TIMES.length : Object.values(t.weekly ?? {}).reduce((n, x) => n + (x?.length ?? 0), 0));

export interface MedicoService {
  name: string;
  /** What the family pays per visit, session or shift, in rupees. */
  price: number;
  duration: string;
}

/** A typical starting charge per category in Kerala, which the suggested services scale from. */
export const TYPICAL_PRICE: Record<string, number> = {
  doctor: 600, dentist: 550, nurse: 500, physio: 600, ot: 650, speech: 600, psych: 1200, diet: 550,
  lab: 180, pharma: 180, caregiver: 1300, aide: 900, baby: 1300, ambulance: 1500, paramedic: 1200,
};

export const MAX_SERVICES = 20;

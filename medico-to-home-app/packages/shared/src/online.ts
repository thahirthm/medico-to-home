import type { MedicoService } from "./availability";
import { roundToTen } from "./pricing";

/**
 * Categories that can see patients over video. Under India's Telemedicine Practice Guidelines (2020) only
 * registered doctors diagnose and prescribe online; the others offer counselling and guidance.
 * Hands-on care (nursing, lab tests, caregiving, ambulance) stays at home.
 */
export const ONLINE_CATEGORIES = ["doctor", "dentist", "psych", "diet", "physio", "speech", "ot", "pharma"];

export const canConsultOnline = (category: string) => ONLINE_CATEGORIES.includes(category);

/** An online consultation usually costs less than a home visit: no travel. */
export const onlineConsultPrice = (basePrice: number) => Math.max(200, roundToTen(basePrice * 0.7));

/** The video consultation offered to a professional who has not set their own services. */
export const onlineConsultation = (basePrice: number): MedicoService => ({ name: "Online consultation", price: onlineConsultPrice(basePrice), duration: "20 min", online: true });

/** Only online-capable categories keep the online flag on their services; every service says yes or no. */
export const onlineServices = (category: string, services: MedicoService[]) => services.map((s) => ({ ...s, online: !!s.online && canConsultOnline(category) }));

/**
 * What a professional offers: their own services, else the category's. Online-capable professionals who have
 * not chosen yet (no service says online or not, as in listings made before online consultations) get one.
 */
export function offeredServices(category: string, basePrice: number, own: MedicoService[], fallback: MedicoService[]): MedicoService[] {
  const list = own.length ? own : fallback;
  const chosen = own.some((s) => typeof s.online === "boolean");
  const services = onlineServices(category, list);
  return !chosen && canConsultOnline(category) && !services.some((s) => s.online) ? [...services, onlineConsultation(basePrice)] : services;
}

/** A call opens this many minutes before the slot. */
export const CALL_OPENS_MIN = 10;
/** And stays open this long after the slot ends, for consultations that run over. */
export const CALL_GRACE_MIN = 60;

/** Whether a call for a visit from `startsAt` to `endsAt` can be joined at `now`. */
export function callIsOpen(startsAt: Date, endsAt: Date, now = new Date()) {
  return now.getTime() >= startsAt.getTime() - CALL_OPENS_MIN * 60_000 && now.getTime() <= endsAt.getTime() + CALL_GRACE_MIN * 60_000;
}

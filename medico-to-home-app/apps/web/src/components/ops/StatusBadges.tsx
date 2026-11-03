import { StatusPill } from "./ui";

export const bookingLabels: Record<string, { label: string; tone: "good" | "bad" | "warn" | "plain" }> = {
  pending_payment: { label: "Awaiting payment", tone: "warn" },
  confirmed: { label: "Confirmed", tone: "plain" },
  active: { label: "Active", tone: "good" },
  completed: { label: "Completed", tone: "good" },
  cancelled: { label: "Cancelled", tone: "bad" },
};

export function BookingBadge({ status }: { status: string }) {
  const entry = bookingLabels[status] ?? { label: status, tone: "plain" as const };
  return <StatusPill tone={entry.tone}>{entry.label}</StatusPill>;
}

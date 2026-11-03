import type { ReactNode } from "react";

type Tone = "good" | "bad" | "warn" | "plain";

const tones: Record<Tone, string> = {
  good: "bg-good-soft text-good",
  bad: "bg-bad-soft text-bad",
  warn: "bg-warn-soft text-warn",
  plain: "bg-wash text-body",
};

const marks: Record<Tone, string> = { good: "✓", bad: "✕", warn: "!", plain: "•" };

export function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-normal ${tones[tone]}`}>
      <span aria-hidden>{marks[tone]}</span>
      {children}
    </span>
  );
}

export function StatTile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="text-[13px] text-muted">{label}</div>
      <div className="mt-2 text-3xl font-medium tracking-tight">{value}</div>
      <div className="mt-1 text-[13px] text-muted">{note}</div>
    </div>
  );
}

export function PageHead({ title, note, children }: { title: string; note: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted">{note}</p>
      </div>
      {children}
    </div>
  );
}

export function Card({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white">
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
          <h2 className="text-[15px] font-medium">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
        active ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"
      }`}
    >
      {children}
    </button>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line-soft text-[12px] text-muted">
            {head.map((h) => (
              <th key={h} scope="col" className="whitespace-nowrap bg-white px-5 py-3 font-normal first:sticky first:left-0 first:z-[1]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-line-soft [&>tr:last-child]:border-0 [&_td]:whitespace-nowrap [&_td]:px-5 [&_td]:py-3.5 [&_td]:align-middle [&_td:first-child]:sticky [&_td:first-child]:left-0 [&_td:first-child]:z-[1] [&_td:first-child]:bg-white">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function Loading({ error }: { error?: string }) {
  return <p className={`py-10 text-center text-sm ${error ? "text-bad" : "text-muted"}`}>{error || "Loading…"}</p>;
}

export const rupees = (amount: number) => "₹" + Math.round(amount).toLocaleString("en-IN");

export const primaryButton = "cursor-pointer rounded-full bg-navy px-4 py-2 text-[13px] font-normal text-white hover:bg-navy-soft disabled:cursor-default disabled:opacity-40";
export const plainButton = "cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-[13px] hover:border-navy";
export const rowAction = "inline-flex min-h-9 cursor-pointer items-center rounded-lg px-2.5 text-[13px] text-muted hover:bg-wash hover:text-navy";
export const field = "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-navy";

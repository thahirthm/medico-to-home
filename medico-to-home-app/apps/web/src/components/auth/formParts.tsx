"use client";

import type { ReactNode } from "react";

// Shared by the patient registration and the family member form.
export const input = "w-full rounded-xl border border-line bg-white px-4 py-3 text-base font-light text-navy outline-none focus:border-navy";
export const label = "flex flex-col gap-1.5 text-[13px] text-body";
export const GENDERS = ["Female", "Male", "Other"];
export const BLOODS = ["A+", "A−", "B+", "B−", "O+", "O−", "AB+", "AB−"];
export const CONDITIONS = ["Diabetes", "High blood pressure", "Heart disease", "Asthma / COPD", "Thyroid", "Arthritis", "Kidney disease", "Stroke", "Cancer"];

export const splitList = (s: string) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
export const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

export function Section({ title, hint, optional, children }: { title: string; hint: string; optional?: boolean; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 sm:p-7">
      <div className="flex flex-col gap-1">
        <h2 className="flex items-center gap-2.5 text-lg font-semibold">
          {title}
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${optional ? "bg-wash text-muted" : "bg-navy text-white"}`}>{optional ? "Optional" : "Required"}</span>
        </h2>
        <p className="text-sm text-muted">{hint}</p>
      </div>
      {children}
    </section>
  );
}

export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${on ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}>
      {children}
    </button>
  );
}

/** Blood group, height, weight, conditions, allergies and medicines: the same health section for everyone. */
export function HealthFields({ f, set, conds, setConds, hint }: {
  f: Record<string, string>;
  set: (k: string) => (e: { target: { value: string } }) => void;
  conds: string[];
  setConds: (fn: (x: string[]) => string[]) => void;
  hint: string;
}) {
  return (
    <Section optional title="Health details" hint={hint}>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={label}>Blood group
          <select className={input} value={f.blood || ""} onChange={set("blood")}>
            <option value="">Not sure</option>
            {BLOODS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </label>
        <label className={label}>Height (cm)
          <input className={input} inputMode="numeric" value={f.h || ""} onChange={set("h")} />
        </label>
        <label className={label}>Weight (kg)
          <input className={input} inputMode="decimal" value={f.w || ""} onChange={set("w")} />
        </label>
      </div>
      <div className="flex flex-col gap-2 text-[13px] text-body">Existing conditions
        <div className="flex flex-wrap gap-2">{CONDITIONS.map((c) => <Chip key={c} on={conds.includes(c)} onClick={() => setConds((x) => toggle(x, c))}>{c}</Chip>)}</div>
      </div>
      <label className={label}>Other conditions
        <input className={input} value={f.otherConds || ""} onChange={set("otherConds")} placeholder="Separate with commas" />
      </label>
      <label className={label}>Allergies
        <input className={input} value={f.alg || ""} onChange={set("alg")} placeholder="Medicines, food… separate with commas" />
      </label>
      <label className={label}>Current medicines
        <textarea className={`${input} min-h-24`} value={f.meds || ""} onChange={set("meds")} placeholder="One per line, or separate with commas" />
      </label>
    </Section>
  );
}

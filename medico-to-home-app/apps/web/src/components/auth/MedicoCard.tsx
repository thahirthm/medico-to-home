"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface CardData {
  id: string;
  name: string;
  gender: string;
  blood: string;
  h: string;
  w: string;
  conds: string[];
  alg: string[];
  meds: string[];
  // The account holder's own card.
  email?: string;
  phone?: string;
  city?: string;
  dob?: string;
  language?: string;
  emergency?: string;
  address?: string;
  // A family member's card: who they are to the account holder, and their age in years.
  relation?: string;
  age?: string;
}

const ageOf = (d: CardData) => {
  const born = new Date(d.dob || "");
  return d.dob && !isNaN(+born) ? Math.floor((Date.now() - +born) / 31_557_600_000) : d.age && /^\d+$/.test(d.age) ? +d.age : null;
};

// Basics count for half; each optional detail fills in the rest.
function progress(d: CardData) {
  const health = d.conds.length || d.alg.length || d.meds.length;
  const [basicList, extraList] = d.relation !== undefined
    ? [[d.name.trim().length > 1, !!d.relation], [d.age, d.gender, d.blood, d.h && d.w, health]]
    : [[d.name.trim().length > 1, /^\d{10}$/.test(d.phone || ""), !!d.city], [d.dob, d.gender, d.language, d.blood, d.h && d.w, d.emergency, d.address, health]];
  const basics = basicList.filter(Boolean).length / basicList.length;
  const extras = extraList.filter(Boolean).length / extraList.length;
  return { basicsDone: basics === 1, percent: Math.round(basics * 50 + extras * 50) };
}

function Blank({ w }: { w: string }) {
  return <span className={`card-shimmer inline-block h-[0.9em] rounded-full align-middle ${w}`} />;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line-soft py-2.5 text-[13px] last:border-0">
      <span className="flex-none text-muted">{label}</span>
      <span className="min-w-0 text-right font-normal break-words text-navy">{children || <span className="text-faint">Not added</span>}</span>
    </div>
  );
}

/** A live preview of a health card (the account holder's or a family member's), built as its form is filled in. */
export function MedicoCard({ d, details = true, onEdit }: { d: CardData; details?: boolean; onEdit?: () => void }) {
  const { basicsDone, percent } = progress(d);
  const age = ageOf(d);
  const family = d.relation !== undefined;
  const first = d.name.trim().split(" ")[0];
  const whose = family ? (first ? `${first}'s` : "their") : "your";
  const memberId = d.id.replace(/-/g, "").slice(0, 12).toUpperCase().replace(/(.{4})(?=.)/g, "$1 ");

  // A brief "updating" pulse each time a detail lands on the card.
  const [updating, setUpdating] = useState(false);
  const mounted = useRef(false);
  const key = JSON.stringify(d);
  useEffect(() => {
    if (!mounted.current) return void (mounted.current = true);
    setUpdating(true);
    const t = setTimeout(() => setUpdating(false), 650);
    return () => clearTimeout(t);
  }, [key]);

  const status = !basicsDone ? `Creating ${whose} Medico card…` : percent < 100 ? `${whose[0]!.toUpperCase() + whose.slice(1)} Medico card is ready` : `${whose[0]!.toUpperCase() + whose.slice(1)} Medico card is complete`;
  const meta = [age !== null && `${age} yrs`, d.gender, d.city].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2" aria-live="polite">
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="flex items-center gap-2 font-medium text-navy">
            {basicsDone && !updating ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-good"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            ) : (
              <span className="size-3.5 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
            )}
            {updating && basicsDone ? `Updating ${whose} Medico card…` : status}
          </span>
          <span className="flex items-center gap-3">
            <span className="tabular-nums text-muted">{percent}%</span>
            {onEdit && <button type="button" onClick={onEdit} className="cursor-pointer font-medium text-navy underline underline-offset-2">{percent < 100 ? "Complete it" : "Edit"}</button>}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-navy transition-[width] duration-500 ease-out" style={{ width: `${Math.max(percent, 4)}%` }} />
        </div>
      </div>

      {/* Front of the card */}
      <div className="relative aspect-[1.586] w-full overflow-hidden rounded-[22px] p-[clamp(16px,5%,24px)] text-white shadow-[0_24px_48px_-20px_rgba(2,8,77,.55)]"
        style={{ background: "radial-gradient(120% 140% at 100% 0%, #3b47c9 0%, rgba(59,71,201,0) 55%), radial-gradient(90% 120% at 0% 100%, #0f1a8a 0%, rgba(15,26,138,0) 60%), #02084d" }}>
        <svg aria-hidden viewBox="0 0 400 120" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-[38%] h-[34%] w-full opacity-[.13]">
          <path d="M0 60 H120 L135 60 L145 30 L158 95 L170 15 L183 80 L192 60 H260 L270 48 L280 72 L288 60 H400" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
        </svg>
        <span aria-hidden className="card-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <span aria-hidden className="pointer-events-none absolute -right-16 -bottom-20 size-56 rounded-full border border-white/10" />
        <span aria-hidden className="pointer-events-none absolute -right-6 -bottom-10 size-36 rounded-full border border-white/10" />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/icon.svg" alt="" className="h-6 w-auto brightness-0 invert" />
              <div className="flex flex-col leading-tight">
                <span className="text-[13px] font-semibold tracking-wide">Medico To Home</span>
                <span className="text-[10px] tracking-[.18em] text-white/60 uppercase">Health card</span>
              </div>
            </div>
            <div className="flex flex-none flex-col items-end gap-1" aria-label={`Blood group ${d.blood || "not added"}`}>
              <span className="flex items-center gap-1.5 text-[9px] tracking-[.16em] text-white/55 uppercase">
                <span className={`size-1.5 rounded-full ${d.blood ? "bg-[#FF5A5F]" : "bg-white/30"}`} />
                Blood group
              </span>
              <span className={`text-[22px] leading-none font-semibold tracking-tight ${d.blood ? "text-white" : "text-white/35"}`}>{d.blood || "—"}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="truncate text-[clamp(18px,5.5vw,24px)] leading-tight font-medium tracking-tight">{d.name.trim() || <Blank w="w-44" />}</span>
            <span className="truncate text-[13px] text-white/75">{meta || <Blank w="w-28" />}</span>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] tracking-[.16em] text-white/55 uppercase">Member ID</span>
              <span className="font-mono text-[13px] tracking-[.12em]">MTH {memberId}</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[9px] tracking-[.16em] text-white/55 uppercase">{family ? "Relation" : "Mobile"}</span>
              {family ? (
                <span className="text-[13px] font-medium tracking-wide">{d.relation || <Blank w="w-20" />}</span>
              ) : (
                <span className="font-mono text-[13px] tracking-wider">{d.phone && /^\d{10}$/.test(d.phone) ? `+91 ${d.phone.slice(0, 5)} ${d.phone.slice(5)}` : <Blank w="w-24" />}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* What the card holds */}
      {details && <div className="rounded-[22px] border border-line bg-white px-5 py-3">
        {family ? (
          <Row label="Age">{age !== null && `${age} years`}</Row>
        ) : (
          <>
            <Row label="Email">{d.email}</Row>
            <Row label="Date of birth">{d.dob && new Date(d.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</Row>
          </>
        )}
        <Row label="Height · Weight">{[d.h && `${d.h} cm`, d.w && `${d.w} kg`].filter(Boolean).join(" · ")}</Row>
        {!family && (
          <>
            <Row label="Language">{d.language}</Row>
            <Row label="Emergency">{d.emergency}</Row>
            <Row label="Address">{d.address}</Row>
          </>
        )}
        {d.alg.length > 0 && (
          <div className="flex flex-col gap-2 border-b border-line-soft py-2.5 last:border-0">
            <span className="text-[13px] text-muted">Allergies</span>
            <div className="flex flex-wrap gap-1.5">{d.alg.map((a) => <span key={a} className="rounded-full bg-bad-soft px-2.5 py-1 text-xs font-medium text-bad">{a}</span>)}</div>
          </div>
        )}
        {d.conds.length > 0 && (
          <div className="flex flex-col gap-2 border-b border-line-soft py-2.5 last:border-0">
            <span className="text-[13px] text-muted">Conditions</span>
            <div className="flex flex-wrap gap-1.5">{d.conds.map((c) => <span key={c} className="rounded-full bg-wash px-2.5 py-1 text-xs text-navy ring-1 ring-line">{c}</span>)}</div>
          </div>
        )}
        {d.meds.length > 0 && <Row label="Medicines">{d.meds.join(", ")}</Row>}
      </div>}
    </div>
  );
}

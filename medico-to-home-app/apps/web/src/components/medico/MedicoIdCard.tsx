"use client";

import { displayName, medicoRole, totalYears, type MedicoProfile } from "@medico/shared";
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

// "Travancore-Cochin Medical Council (TCMC)" → "TCMC"; anything without a short form stays as it is.
const councilShort = (c: string) => c.match(/\(([^)]+)\)$/)?.[1] ?? c.replace(/^Kerala State /, "").replace(/ Council$/, "");

// Each role wears its own colour, like the bands on a hospital ID.
const ROLE_COLOUR: Record<string, string> = {
  Doctor: "#1F4FD8", Nurse: "#0E9F8E", Pharmacist: "#2A7FB8", Physiotherapist: "#1F9D6B", "Occupational Therapist": "#D9467A",
  "Speech & Language Therapist": "#B8458F", "Clinical Psychologist": "#5A4BD6", Psychologist: "#5A4BD6", Dietitian: "#6E9A1F",
  "Lab Technician": "#7B4BD6", Caregiver: "#C77D1A", "Home Health Aide": "#B86A12", "Baby Care Attendant": "#E0719A",
  "Ambulance Driver": "#C22F2F", Paramedic: "#D4532A",
  Caretaker: "#C77D1A", "Lab technician": "#7B4BD6", "Other therapist": "#D9467A",
};

const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  approved: { label: "Verified Medico", bg: "#E8F5EF", fg: "#1F7A55" },
  info_needed: { label: "Details needed", bg: "#FDF1EC", fg: "#B4532A" },
  rejected: { label: "Not approved", bg: "#FDECEC", fg: "#C22F2F" },
};

const HEADER_BG = "radial-gradient(110% 150% at 100% 0%, #3b47c9 0%, rgba(59,71,201,0) 60%), radial-gradient(80% 120% at 0% 100%, #121c8f 0%, rgba(18,28,143,0) 70%), #02084d";
const FACE = "absolute inset-0 flex flex-col overflow-hidden rounded-[26px] bg-white ring-1 ring-line [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

/** A barcode drawn from the Medico ID, so every badge has its own. */
function Barcode({ code }: { code: string }) {
  const widths = [...code.replace(/\W/g, "").toUpperCase()].flatMap((ch) => {
    const n = parseInt(ch, 36) || 7;
    return [1 + (n % 3), 1 + ((n >> 1) % 2), 1 + ((n >> 2) % 3), 1 + (n % 2)];
  });
  const starts = widths.map((_, i) => widths.slice(0, i).reduce((a, b) => a + b, 0));
  const total = widths.reduce((a, b) => a + b, 0);
  return (
    <svg aria-hidden viewBox={`0 0 ${total} 28`} preserveAspectRatio="none" className="h-7 w-full text-navy" fill="currentColor">
      {widths.map((w, i) => (i % 2 === 0 ? <rect key={i} x={starts[i]} y="0" width={w} height="28" /> : null))}
    </svg>
  );
}

const Slot = () => <span aria-hidden className="absolute top-3.5 left-1/2 h-2.5 w-14 -translate-x-1/2 rounded-full bg-[#E9EBF2] shadow-[inset_0_1px_2px_rgba(0,0,0,.35)]" />;

function Tags({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9px] tracking-[.16em] text-muted uppercase">{label}</span>
      <div className="flex flex-wrap gap-1">{items.map((t) => <span key={t} className="rounded-full bg-[#F5F6FA] px-2.5 py-0.5 text-[11.5px] text-navy ring-1 ring-line">{t}</span>)}</div>
    </div>
  );
}

function Line({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-[12.5px] leading-snug text-body">
      <span aria-hidden className="mt-px flex size-6 flex-none items-center justify-center rounded-full bg-[#F5F6FA] text-navy">{icon}</span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}

/**
 * The professional's ID badge on a lanyard. The front is the ID; tapping flips it to the back, which shows
 * only what families see on the public profile, never contact details.
 */
export function MedicoIdCard({ p, id, stage }: { p: MedicoProfile; id: string; stage: string }) {
  const name = displayName(p) || "Your name";
  const first = displayName(p).split(" ").slice(0, 2).join(" ") || "this medico";
  const colour = ROLE_COLOUR[medicoRole(p.role)] ?? "#02084D";
  const status = STATUS[stage] ?? { label: "Verification in progress", bg: "#FBF6EA", fg: "#9A6A0E" };
  const medicoId = `MTH-M ${id.replace(/-/g, "").slice(0, 8).toUpperCase().replace(/(.{4})(?=.)/, "$1 ")}`;
  const years = totalYears(p);
  const awards = p.awards.filter((a) => a.title);
  const latest = p.workplaces.filter((w) => w.place).find((w) => w.to === "Present") ?? p.workplaces.filter((w) => w.place).at(-1);
  const [flipped, setFlipped] = useState(false);
  const card = useRef<HTMLDivElement>(null);

  // A gentle 3D tilt and a glare that follow the pointer, like holding the badge up to the light.
  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    const el = card.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
    el.style.setProperty("--glare", "1");
  };
  const untilt = () => {
    const el = card.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--glare", "0");
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    setFlipped((f) => !f);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="badge-swing mx-auto flex w-full max-w-[330px] flex-col items-center" style={{ perspective: "1000px" }}>
        {/* Lanyard, and the clip that holds the badge through its slot */}
        <div aria-hidden className="relative z-10 flex flex-col items-center">
          <div className="h-12 w-8" style={{ background: `repeating-linear-gradient(135deg, ${colour} 0 6px, color-mix(in srgb, ${colour} 80%, #000) 6px 12px)` }} />
          <div className="relative -mt-1 flex h-7 w-16 items-center justify-center rounded-[10px] bg-gradient-to-b from-[#F1F3F8] via-[#C9CDD9] to-[#9EA3B5] shadow-[0_2px_4px_rgba(0,0,0,.2)] ring-1 ring-black/10">
            <span className="size-2.5 rounded-full bg-gradient-to-b from-[#8C91A3] to-[#C9CDD9] shadow-inner" />
          </div>
          <div className="-mt-px h-5 w-7 rounded-b-md bg-gradient-to-b from-[#B5BACA] to-[#8C91A3] shadow-[0_2px_3px_rgba(0,0,0,.25)]" />
        </div>

        <div ref={card} role="button" tabIndex={0} aria-pressed={flipped} onClick={() => setFlipped((f) => !f)} onKeyDown={onKey} onPointerMove={tilt} onPointerLeave={untilt}
          aria-label={flipped ? `${name}'s profile. Press to see the ID side.` : `${name}, Medico ID card. Press to see their profile.`}
          className="relative -mt-4 aspect-[330/540] w-full cursor-pointer rounded-[26px] shadow-[0_30px_60px_-24px_rgba(2,8,77,.5)] outline-none transition-transform duration-300 ease-out focus-visible:ring-4 focus-visible:ring-navy/30"
          style={{ transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))", transformStyle: "preserve-3d" }}>
          <div className="relative size-full transition-transform duration-700 ease-[cubic-bezier(.3,.7,.3,1)] motion-reduce:duration-0"
            style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "none" }}>

            {/* Front: the ID */}
            <article aria-hidden={flipped} className={FACE}>
              <div className="relative h-[156px] flex-none overflow-hidden text-white" style={{ background: HEADER_BG }}>
                <Slot />
                <span aria-hidden className="pointer-events-none absolute -top-10 -left-10 size-40 rounded-full border border-white/10" />
                <span aria-hidden className="pointer-events-none absolute -right-12 -bottom-16 size-48 rounded-full border border-white/10" />
                <span aria-hidden className="card-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <div className="relative flex flex-col items-center pt-9">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brand/icon.svg" alt="" className="h-5 w-auto brightness-0 invert" />
                    <span className="text-[14px] font-semibold tracking-wide">Medico To Home</span>
                  </div>
                  <p className="mt-1.5 text-[9.5px] tracking-[.26em] text-white/55 uppercase">Home care professional</p>
                </div>
              </div>

              <div className="relative -mt-[58px] flex justify-center">
                <div className="relative rounded-[30px] bg-white p-1.5 shadow-[0_10px_24px_-10px_rgba(2,8,77,.45)]">
                  {p.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photoUrl} alt="" className="size-[108px] rounded-[24px] bg-[#F5F6FA] object-cover" />
                  ) : (
                    <span className="flex size-[108px] items-center justify-center rounded-[24px] bg-[#EEF0F6] text-4xl font-light text-navy">{(p.name || "M")[0]!.toUpperCase()}</span>
                  )}
                  {stage === "approved" && (
                    <span className="absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-full bg-[#1F9D6B] text-white ring-4 ring-white" title="Verified">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 px-5 pt-3.5 text-center">
                <h3 className="text-[21px] leading-tight font-semibold tracking-tight text-navy">{name}</h3>
                <p className="text-[14px] font-medium" style={{ color: colour }}>{p.specialisation || p.role || "Medico"}</p>
                {p.qualification && <p className="line-clamp-1 text-[12px] leading-snug text-muted">{p.qualification}</p>}
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium" style={{ background: status.bg, color: status.fg }}>
                  <span className={`size-1.5 rounded-full bg-current ${stage === "approved" || stage === "rejected" ? "" : "dot-pulse"}`} />
                  {status.label}
                </span>
              </div>

              <dl className="mx-5 mt-auto grid grid-cols-2 gap-x-4 gap-y-3 border-t border-dashed border-line pt-4">
                <div className="min-w-0">
                  <dt className="text-[9px] tracking-[.16em] text-muted uppercase">Reg. no{p.council ? ` · ${councilShort(p.council)}` : ""}</dt>
                  <dd className="truncate font-mono text-[13px] text-navy">{p.registrationNo || "—"}</dd>
                </div>
                <div className="min-w-0 text-right">
                  <dt className="text-[9px] tracking-[.16em] text-muted uppercase">District</dt>
                  <dd className="truncate text-[13px] text-navy">{p.district || "—"}</dd>
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <dt className="sr-only">Medico ID</dt>
                  <Barcode code={medicoId} />
                  <dd className="text-center font-mono text-[11px] tracking-[.24em] text-muted">{medicoId}</dd>
                </div>
              </dl>

              <div className="relative mt-4 flex-none overflow-hidden py-2.5 text-center text-[12px] font-semibold tracking-[.32em] text-white uppercase" style={{ background: colour }}>
                <span aria-hidden className="card-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <span className="relative">{p.role || "Medico"}</span>
              </div>
            </article>

            {/* Back: what families see on the public profile */}
            <article aria-hidden={!flipped} className={FACE} style={{ transform: "rotateY(180deg)" }}>
              <div className="relative flex-none overflow-hidden px-5 pt-9 pb-4 text-white" style={{ background: HEADER_BG }}>
                <Slot />
                <span aria-hidden className="pointer-events-none absolute -right-12 -bottom-16 size-40 rounded-full border border-white/10" />
                <div className="relative flex items-center gap-3">
                  {p.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photoUrl} alt="" className="size-11 flex-none rounded-xl bg-white object-cover ring-2 ring-white/80" />
                  ) : (
                    <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-white/10 text-lg ring-1 ring-white/25">{(p.name || "M")[0]!.toUpperCase()}</span>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-semibold">{name}</div>
                    <div className="truncate text-[12px] text-white/65">{[p.role, p.specialisation].filter(Boolean).join(" · ") || "Medico"}</div>
                  </div>
                </div>
              </div>

              <dl className="grid flex-none grid-cols-3 border-b border-line-soft text-center">
                {[["Experience", `${years} yrs`], ["Travels", `${p.radiusKm} km`], ["Awards", String(awards.length)]].map(([k, v]) => (
                  <div key={k} className="border-r border-line-soft py-2.5 last:border-0">
                    <dt className="text-[9px] tracking-[.14em] text-muted uppercase">{k}</dt>
                    <dd className="text-[16px] font-semibold text-navy">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-hidden px-5 pt-3.5">
                {p.bio && <p className="line-clamp-4 text-[12.5px] leading-relaxed text-body">{p.bio}</p>}
                {latest && (
                  <Line icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" /></svg>}>
                    <span className="font-medium text-navy">{latest.place}</span>
                    {(latest.role || latest.from) && <span className="text-muted"> · {[latest.role, [latest.from, latest.to].filter(Boolean).join("–")].filter(Boolean).join(", ")}</span>}
                  </Line>
                )}
                {awards[0] && (
                  <Line icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="9" r="6" /><path d="M8.5 14 7 22l5-3 5 3-1.5-8" /></svg>}>
                    <span className="font-medium text-navy">{awards[0].title}</span>
                    {(awards[0].by || awards[0].year) && <span className="text-muted"> · {[awards[0].by, awards[0].year].filter(Boolean).join(", ")}</span>}
                  </Line>
                )}
                <Tags label="Speaks" items={p.languages} />
                <Tags label="Available" items={p.slots} />
                {!p.bio && !latest && !awards[0] && !p.languages.length && !p.slots.length && (
                  <p className="m-auto text-center text-[13px] text-faint">Profile details will appear here as {first} fills them in.</p>
                )}
              </div>

              <div className="relative mt-3 flex flex-none items-center justify-center gap-2 overflow-hidden py-2.5 text-[11px] font-semibold tracking-[.24em] text-white uppercase" style={{ background: colour }}>
                <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5" /></svg>
                {p.district ? `Visits homes in ${p.district}` : "Home visits"}
              </div>
            </article>
          </div>

          {/* Glare that follows the pointer */}
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[26px] transition-opacity duration-300"
            style={{ opacity: "var(--glare, 0)", background: "radial-gradient(circle at var(--gx, 50%) var(--gy, 0%), rgba(255,255,255,.35), rgba(255,255,255,0) 45%)", mixBlendMode: "soft-light", transform: "translateZ(1px)" }} />
        </div>
      </div>

      <button type="button" onClick={() => setFlipped((f) => !f)} className="flex cursor-pointer items-center gap-1.5 text-[12.5px] text-muted hover:text-navy">
        <svg aria-hidden width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5" /></svg>
        {flipped ? "Tap to see the ID side" : "Tap the card to see the profile side"}
      </button>
    </div>
  );
}

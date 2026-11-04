"use client";

import { totalYears, type MedicoProfile } from "@medico/shared";
import type { ReactNode } from "react";

// A Medico's full profile, shown on their dashboard while verification runs and on the Profile page.

function Detail({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-line bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[16px] font-medium">{title}</h2>
        {note && <span className="text-[12px] text-muted">{note}</span>}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Facts({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[minmax(110px,36%)_1fr] gap-x-4 gap-y-2.5 text-[14px]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="min-w-0 break-words">{v || <span className="text-faint">Not added</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

const Tags = ({ items, empty }: { items: string[]; empty: string }) =>
  items.length ? (
    <div className="flex flex-wrap gap-1.5">{items.map((t) => <span key={t} className="rounded-full bg-[#F5F6FA] px-3 py-1 text-[13px] ring-1 ring-line">{t}</span>)}</div>
  ) : (
    <span className="text-[14px] text-faint">{empty}</span>
  );

/** Experience, awards and travel distance at a glance. */
export function ProfileStats({ p }: { p: MedicoProfile }) {
  return (
    <dl className="grid grid-cols-3 rounded-[20px] border border-line bg-white text-center">
      {[["Experience", `${totalYears(p)} yrs`], ["Awards", String(p.awards.filter((a) => a.title).length)], ["Travels", `${p.radiusKm} km`]].map(([k, v]) => (
        <div key={k} className="border-r border-line-soft px-2 py-3.5 last:border-0">
          <dt className="text-[12px] text-muted">{k}</dt>
          <dd className="text-[18px] font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Every section of the profile: about, professional details, experience, awards, availability and contact. */
export function ProfileDetails({ p }: { p: MedicoProfile }) {
  const years = totalYears(p);
  const awards = p.awards.filter((a) => a.title);
  const workplaces = p.workplaces.filter((w) => w.place);
  return (
    <div className="flex min-w-0 flex-col gap-5">
    <Detail title="About" note="Families see this on your profile">
      {p.bio ? <p className="text-[15px] leading-relaxed text-body">{p.bio}</p> : <span className="text-[14px] text-faint">No bio yet.</span>}
    </Detail>

    <Detail title="Professional details">
      <Facts rows={[
        ["Role", p.role], ["Specialisation", p.specialisation], ["Qualification", p.qualification], ["Gender", p.gender],
        ["Council", p.council], ["Registration no", p.registrationNo && <span className="font-mono">{p.registrationNo}</span>],
      ]} />
    </Detail>

    <Detail title="Experience" note={`${years} year${years === 1 ? "" : "s"} in total`}>
      {workplaces.length ? (
        <ol className="relative grid gap-4 border-l border-line pl-5">
          {workplaces.map((w, i) => (
            <li key={i} className="relative">
              <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full bg-navy ring-4 ring-white" />
              <div className="text-[15px] font-medium">{w.place}</div>
              <div className="text-[13px] text-muted">{[w.role, [w.from, w.to].filter(Boolean).join(" – ")].filter(Boolean).join(" · ")}</div>
            </li>
          ))}
        </ol>
      ) : (
        <span className="text-[14px] text-body">{years ? `${years} year${years === 1 ? "" : "s"} of experience.` : <span className="text-faint">Not added</span>}</span>
      )}
    </Detail>

    <Detail title="Awards and recognition">
      {awards.length ? (
        <ul className="grid gap-3">
          {awards.map((a, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-9 flex-none items-center justify-center rounded-full bg-[#FBF6EA] text-[#B07A12]" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="9" r="6" /><path d="M8.5 14 7 22l5-3 5 3-1.5-8" /></svg>
              </span>
              <div className="min-w-0">
                <div className="text-[15px] font-medium">{a.title}</div>
                <div className="text-[13px] text-muted">{[a.by, a.year].filter(Boolean).join(" · ") || "—"}</div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-[14px] text-faint">No awards added.</span>
      )}
    </Detail>

    <Detail title="Availability">
      <div className="grid gap-4 text-[14px]">
        <div className="grid gap-2"><span className="text-muted">When you work</span><Tags items={p.slots} empty="Not added" /></div>
        <div className="grid gap-2"><span className="text-muted">Languages</span><Tags items={p.languages} empty="Not added" /></div>
        <div className="flex justify-between gap-4 border-t border-line-soft pt-3"><span className="text-muted">Travels up to</span><span>{p.radiusKm} km{p.district ? ` from ${p.district}` : ""}</span></div>
      </div>
    </Detail>

    <Detail title="Contact" note="Only our team sees these">
      <Facts rows={[["Mobile", p.phone && `+91 ${p.phone}`], ["Email", p.email], ["District", p.district]]} />
    </Detail>
    </div>
  );
}

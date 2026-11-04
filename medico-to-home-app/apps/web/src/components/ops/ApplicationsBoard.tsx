"use client";

import {
  availabilityLines, medicoPlace, PERSONAL_FIELDS, professionByLabel, spokenLanguages, totalYears, VERIFICATION_STEPS, WORK_FIELDS,
  type ApplicationDocument, type Details, type Field, type MedicoProfile, type VerificationRecord, type VerificationStep,
} from "@medico/shared";
import { useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { Card, Chip, Loading, plainButton, primaryButton, StatusPill, field } from "./ui";
import { useApi } from "./useApi";

const stages = VERIFICATION_STEPS.map((s) => ({ key: s.stage, label: s.label }));

const FILTERS = [
  { key: "review", label: "To review", match: (s: string) => stages.some((x) => x.key === s) },
  { key: "waiting", label: "Waiting for applicant", match: (s: string) => s === "info_needed" },
  { key: "approved", label: "Approved", match: (s: string) => s === "approved" },
  { key: "rejected", label: "Rejected", match: (s: string) => s === "rejected" },
  { key: "all", label: "All", match: () => true },
] as const;

interface Application {
  id: number;
  name: string;
  phone: string;
  email: string;
  gender: string;
  profession: string;
  district: string;
  registration_no: string;
  details: Details;
  documents: ApplicationDocument[];
  stage: string;
  decision_note: string;
  checks: Partial<Record<VerificationStep["stage"], VerificationRecord>> | null;
  created_at: string;
  updated_at: string;
}

const show = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(", ") : v) || "";
const date = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function ApplicationsBoard() {
  const { data, error, reload } = useApi<Application[]>("/admin/applications");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("review");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const [viewing, setViewing] = useState<Record<number, string>>({});
  if (!data) return <Loading error={error} />;

  // Asking for more details or rejecting always tells the applicant why. Passing happens in the step's checklist.
  const decide = (id: number, action: "ask" | "reject") => {
    const note = prompt(action === "ask" ? "What does the applicant need to fix or send?" : "Reason for rejecting (the applicant will see this):");
    if (note === null) return;
    api(`/admin/applications/${id}/decide`, { body: { action, note } }).then(reload).catch((e: Error) => alert(e.message));
  };

  const q = query.trim().toLowerCase();
  const rule = FILTERS.find((f) => f.key === filter)!;
  const list = data.filter((a) => rule.match(a.stage) && (!q || [a.name, a.phone, a.email, a.profession, a.registration_no].join(" ").toLowerCase().includes(q)));

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label} · {data.filter((a) => f.match(a.stage)).length}
          </Chip>
        ))}
        <input className={`${field} ml-auto w-full sm:w-64`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, reg. no." aria-label="Search applications" />
      </div>

      {!list.length && (
        <Card>
          <p className="px-5 py-10 text-center text-sm text-muted">{data.length ? "No applications here." : "No applications yet. They appear here when someone applies on the Join page."}</p>
        </Card>
      )}

      {list.map((a) => {
        const decided = a.stage === "approved" || a.stage === "rejected";
        const waiting = a.stage === "info_needed";
        const index = decided ? stages.length : waiting ? 0 : stages.findIndex((s) => s.key === a.stage);
        const expanded = open === a.id;
        // The step being looked at: the current one, unless staff opened an earlier one to see its record.
        const shown = viewing[a.id] ?? (a.stage === "approved" ? "interview" : a.stage);
        const showStep = a.stage !== "rejected" && !waiting && VERIFICATION_STEPS.find((s) => s.stage === shown);
        return (
          <Card key={a.id}>
            <div className="flex flex-wrap items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <div className="text-base font-medium">{a.name}</div>
                <div className="mt-0.5 text-[13px] text-muted">
                  {a.profession} · {a.district} · {a.phone} · Reg. {a.registration_no || "not given"}
                </div>
                <div className="mt-0.5 text-[12px] text-faint">
                  Applied {date(a.created_at)}
                  {a.email && ` · ${a.email}`}
                </div>
              </div>
              {decided ? (
                <StatusPill tone={a.stage === "approved" ? "good" : "bad"}>{a.stage === "approved" ? "Approved" : "Rejected"}</StatusPill>
              ) : waiting ? (
                <StatusPill tone="warn">Waiting for applicant</StatusPill>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => decide(a.id, "reject")} className={plainButton}>Reject</button>
                  <button onClick={() => decide(a.id, "ask")} className={plainButton}>Ask for info</button>
                </div>
              )}
            </div>
            {a.decision_note && (waiting || a.stage === "rejected") && (
              <p className="border-t border-line-soft px-5 py-3 text-[13px] text-body">Note to applicant: {a.decision_note}</p>
            )}
            {a.stage !== "rejected" && !waiting && (
              <ol className="grid grid-cols-2 gap-1 border-t border-line-soft px-3 py-2 sm:grid-cols-4">
                {stages.map((s, i) => {
                  const selected = shown === s.key;
                  return (
                    <li key={s.key}>
                      <button onClick={() => setViewing((v) => ({ ...v, [a.id]: s.key }))} aria-pressed={selected}
                        className={`flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2.5 text-left text-[13px] transition-colors ${selected ? "bg-wash" : "hover:bg-wash/60"} ${i <= index ? "text-navy" : "text-faint"}`}>
                        <span aria-hidden className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border text-[11px] ${i < index ? "border-good bg-good text-white" : i === index ? "border-navy bg-navy text-white" : "border-line"}`}>
                          {i < index ? "✓" : i + 1}
                        </span>
                        <span className={selected ? "font-medium" : ""}>{s.label}</span>
                        {i === index && <span className="ml-auto hidden rounded-full bg-warn-soft px-2 py-0.5 text-[10px] text-warn lg:inline">Now</span>}
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
            {showStep && (
              <StepPanel key={`${a.id}-${showStep.stage}`} a={a} step={showStep} position={stages.findIndex((s) => s.key === showStep.stage)} current={index} onPassed={() => { setViewing((v) => { const n = { ...v }; delete n[a.id]; return n; }); reload(); }} />
            )}
            <button
              onClick={() => setOpen(expanded ? null : a.id)}
              aria-expanded={expanded}
              className="flex w-full cursor-pointer items-center justify-between border-t border-line-soft px-5 py-3 text-left text-[13px] font-medium text-navy hover:bg-wash"
            >
              {expanded ? "Hide full application" : isMedico(a) ? "View Medico profile" : `View full application · ${a.documents?.length ?? 0} documents`}
              <span aria-hidden className={`transition-transform ${expanded ? "rotate-180" : ""}`}>⌄</span>
            </button>
            {expanded && (isMedico(a) ? <MedicoApplication profile={a.details.profile as unknown as MedicoProfile} /> : <FullApplication a={a} />)}
          </Card>
        );
      })}
    </div>
  );
}

const isMedico = (a: Application) => (a.details as Record<string, unknown>)?.kind === "medico";

/** A registration from the 8-step Medico onboarding. Every field is optional, so gaps show as "Not added". */
function MedicoApplication({ profile: p }: { profile: MedicoProfile }) {
  const years = totalYears(p);
  return (
    <div className="grid gap-5 border-t border-line-soft bg-wash/60 px-5 py-5 lg:grid-cols-2">
      <section className="flex items-center gap-4 rounded-xl border border-line bg-white p-4 lg:col-span-2">
        {p.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photoUrl} alt="" className="size-16 rounded-full object-cover" />
        ) : (
          <span className="flex size-16 items-center justify-center rounded-full bg-wash text-xs text-muted">No photo</span>
        )}
        <p className="text-[13px] leading-relaxed text-body">{p.bio || "No bio yet."}</p>
      </section>
      <Section title="About" rows={[["Full name", p.name], ["Role", p.role], ["Specialisation", p.specialisation], ["Qualification", p.qualification], ["Gender", p.gender]].map(([k, v]) => [k, v || "Not added"] as const)} />
      <Section title="Registration and contact" rows={[["Council", p.council], ["Registration no.", p.registrationNo], ["Mobile", p.phone], ["Email", p.email], ["District", p.district], ["Town", p.town]].map(([k, v]) => [k, v || "Not added"] as const)} />
      <Section title="Experience" rows={[
        ["Total", years ? `${years} years` : "Not added"],
        ...p.workplaces.filter((w) => w.place).map((w) => [w.place, [w.role, [w.from, w.to].filter(Boolean).join("–")].filter(Boolean).join(" · ")] as const),
        ...p.awards.filter((x) => x.title).map((x) => [`Award: ${x.title}`, [x.by, x.year].filter(Boolean).join(", ")] as const),
      ]} />
      <Section title="Availability" rows={[
        ["Timetable", availabilityLines(p).join(" · ") || "Not added"], ["Also visits", (p.serviceTowns ?? []).join(", ") || "Not added"],
        ["Languages", spokenLanguages(p).join(", ") || "Not added"], ["Travels up to", `${p.radiusKm} km`],
      ]} />
      <Section title="Services and charges" rows={(p.services ?? []).length ? p.services.map((x) => [x.name, [`₹${x.price}`, x.duration].filter(Boolean).join(" · ")] as const) : [["Services", "Not added"] as const]} />
    </div>
  );
}

function FullApplication({ a }: { a: Application }) {
  const profession = professionByLabel(a.profession);
  const d = a.details ?? {};
  const rows = (fields: Field[]) => fields.map((f) => [f.label, show(d[f.key])] as const);
  return (
    <div className="grid gap-5 border-t border-line-soft bg-wash/60 px-5 py-5 lg:grid-cols-2">
      <Section title="Personal" rows={[["Full name", a.name], ["Gender", a.gender], ["Mobile", a.phone], ["Email", a.email], ["District", a.district], ...rows(PERSONAL_FIELDS)]} />
      <Section title={`${a.profession} details`} rows={rows(profession?.fields ?? [])} />
      <Section title="Work preferences" rows={rows(WORK_FIELDS)} />
      <DocumentsList a={a} />
    </div>
  );
}

/** The documents a Join-page application uploaded, each opened through a short-lived private link. */
function DocumentsList({ a }: { a: Application }) {
  const profession = professionByLabel(a.profession);
  const [opening, setOpening] = useState("");

  const openDoc = async (kind: string) => {
    // Open the tab now, while the click still counts, then point it at the private link.
    const tab = window.open("", "_blank");
    setOpening(kind);
    try {
      const { url } = await api<{ url: string }>(`/admin/applications/${a.id}/documents/${kind}`);
      if (tab) tab.location.assign(url);
      else window.location.assign(url);
    } catch (e) {
      tab?.close();
      alert((e as Error).message);
    }
    setOpening("");
  };

  return (
    <section className="rounded-xl border border-line bg-white">
      <h4 className="border-b border-line-soft px-4 py-2.5 text-[13px] font-medium">Documents</h4>
      <ul className="divide-y divide-line-soft">
        {(profession?.documents ?? []).map((spec) => {
          const file = a.documents?.find((f) => f.kind === spec.key);
          return (
            <li key={spec.key} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
              <span className="min-w-0">
                <span className="block">{spec.label}{!spec.required && <span className="text-faint"> · optional</span>}</span>
                <span className="block truncate text-muted">{file ? file.fileName : "Not uploaded"}</span>
              </span>
              {file && (
                <button onClick={() => openDoc(spec.key)} disabled={!!opening} className="min-h-9 flex-none cursor-pointer rounded-full border border-line px-3.5 text-[13px] text-navy hover:border-navy disabled:opacity-60">
                  {opening === spec.key ? "Opening…" : "Open"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// What staff look at in each step, from the Medico profile or, for a Join-page application, its answers.
function facts(a: Application) {
  if (isMedico(a)) {
    const p = a.details.profile as unknown as MedicoProfile;
    return {
      name: p.name, role: p.role, specialisation: p.specialisation, qualification: p.qualification, gender: p.gender, photo: p.photoUrl, bio: p.bio,
      council: p.council, registration: p.registrationNo, phone: p.phone, email: p.email, district: medicoPlace(p),
      years: totalYears(p), languages: spokenLanguages(p), slots: availabilityLines(p), radius: `${p.radiusKm} km`,
      workplaces: p.workplaces.filter((w) => w.place).map((w) => [w.place, [w.role, [w.from, w.to].filter(Boolean).join("–")].filter(Boolean).join(" · ")] as const),
      awards: p.awards.filter((x) => x.title).map((x) => [x.title, [x.by, x.year].filter(Boolean).join(", ")] as const),
    };
  }
  const d = a.details ?? {};
  const list = (v: unknown) => (Array.isArray(v) ? (v as string[]) : v ? [String(v)] : []);
  return {
    name: a.name, role: a.profession, specialisation: show(d.specialisation), qualification: show(d.qualification), gender: a.gender, photo: "", bio: show(d.bio),
    council: show(d.council), registration: a.registration_no, phone: a.phone, email: a.email, district: a.district,
    years: Number(show(d.experience_years)) || 0, languages: list(d.languages), slots: list(d.availability), radius: d.radius_km ? `${show(d.radius_km)} km` : "",
    workplaces: [] as (readonly [string, string])[], awards: [] as (readonly [string, string])[],
  };
}

function Photo({ src, size = "size-28" }: { src: string; size?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="Applicant's photo" className={`${size} flex-none rounded-2xl bg-wash object-cover ring-1 ring-line`} />
  ) : (
    <span className={`${size} flex flex-none items-center justify-center rounded-2xl bg-wash text-xs text-muted ring-1 ring-line`}>No photo</span>
  );
}

/** The details that matter for one step, so staff check exactly what the step is about. */
function StepDetails({ a, stage }: { a: Application; stage: VerificationStep["stage"] }) {
  const f = facts(a);
  const none = "Not added";
  const v = (x: string) => x || none;
  if (stage === "documents")
    return (
      <div className="grid gap-4">
        <section className="flex flex-wrap items-start gap-4 rounded-xl border border-line bg-white p-4">
          <Photo src={f.photo} size="size-36" />
          <div className="min-w-0 flex-1 text-[13px] leading-relaxed text-body">{f.bio || <span className="text-faint">No bio yet.</span>}</div>
        </section>
        <Section title="Name and qualification" rows={[["Full name", v(f.name)], ["Role", v(f.role)], ["Specialisation", v(f.specialisation)], ["Qualification", v(f.qualification)], ["Gender", v(f.gender)]]} />
        {!isMedico(a) && <DocumentsList a={a} />}
      </div>
    );
  if (stage === "council")
    return (
      <div className="grid gap-4">
        <section className="rounded-xl border border-line bg-white p-4">
          <div className="text-[12px] text-muted">Registration number</div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="font-mono text-[22px] tracking-wide">{f.registration || "Not given"}</span>
            {f.registration && <button onClick={() => navigator.clipboard?.writeText(f.registration)} className={plainButton}>Copy</button>}
          </div>
          <div className="mt-2 text-[13px] text-body">{f.council || <span className="text-faint">Council not chosen</span>}</div>
        </section>
        <Section title="Match these against the register" rows={[["Full name", v(f.name)], ["Role", v(f.role)], ["Qualification", v(f.qualification)], ["Specialisation", v(f.specialisation)]]} />
      </div>
    );
  if (stage === "police")
    return (
      <div className="grid gap-4">
        <section className="flex flex-wrap items-start gap-4 rounded-xl border border-line bg-white p-4">
          <Photo src={f.photo} />
          <div className="min-w-0 flex-1">
            <div className="text-[16px] font-medium">{f.name || "No name"}</div>
            <div className="text-[13px] text-muted">{[f.gender, f.district].filter(Boolean).join(" · ")}</div>
            <p className="mt-2 text-[12px] text-muted">Compare this photo with their government ID.</p>
          </div>
        </section>
        <section className="rounded-xl border border-line bg-white">
          <h4 className="border-b border-line-soft px-4 py-2.5 text-[13px] font-medium">Contact</h4>
          <dl className="grid grid-cols-[minmax(120px,40%)_1fr] gap-x-4 gap-y-2 px-4 py-3 text-[13px]">
            <dt className="text-muted">Mobile</dt>
            <dd className="m-0">{f.phone ? <a href={`tel:+91${f.phone}`} className="underline">+91 {f.phone}</a> : <span className="text-faint">{none}</span>}</dd>
            <dt className="text-muted">Email</dt>
            <dd className="m-0 wrap-break-word">{f.email ? <a href={`mailto:${f.email}`} className="underline">{f.email}</a> : <span className="text-faint">{none}</span>}</dd>
            <dt className="text-muted">District</dt>
            <dd className="m-0">{v(f.district)}</dd>
          </dl>
        </section>
        {!isMedico(a) && <DocumentsList a={a} />}
      </div>
    );
  return (
    <div className="grid gap-4">
      <Section title="Experience" rows={[["Total", f.years ? `${f.years} years` : none], ...f.workplaces]} />
      {f.awards.length > 0 && <Section title="Awards" rows={f.awards} />}
      <Section title="Languages and availability" rows={[["Languages", f.languages.join(", ") || none], ["Free", f.slots.join(", ") || none], ["Travels up to", v(f.radius)]]} />
      <section className="rounded-xl border border-line bg-white p-4 text-[13px] leading-relaxed text-body">
        <div className="mb-1 text-[12px] text-muted">Bio, to talk through</div>
        {f.bio || <span className="text-faint">No bio yet.</span>}
      </section>
    </div>
  );
}

/** One verification step: what to look at, the checks to tick, and passing it once every check is ticked. */
function StepPanel({ a, step, position, current, onPassed }: { a: Application; step: VerificationStep; position: number; current: number; onPassed: () => void }) {
  const record = a.checks?.[step.stage];
  const isCurrent = position === current && a.stage === step.stage;
  const [ticked, setTicked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const all = ticked.length === step.checks.length;
  const last = position === VERIFICATION_STEPS.length - 1;

  const pass = async () => {
    setBusy(true);
    setError("");
    try {
      await api(`/admin/applications/${a.id}/decide`, { body: { action: "pass", checks: ticked, note } });
      onPassed();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  let checklist: ReactNode;
  if (isCurrent) {
    checklist = (
      <>
        <ul className="grid gap-1">
          {step.checks.map((c) => {
            const on = ticked.includes(c.key);
            return (
              <li key={c.key}>
                <label className={`flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${on ? "bg-good-soft text-navy" : "hover:bg-wash"}`}>
                  <input type="checkbox" checked={on} onChange={() => setTicked((t) => (on ? t.filter((k) => k !== c.key) : [...t, c.key]))} className="mt-0.5 size-4 flex-none accent-[#1f9d6b]" />
                  {c.label}
                </label>
              </li>
            );
          })}
        </ul>
        <textarea className={`${field} min-h-16`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes for the team (optional)" aria-label="Notes for the team" />
        {error && <p role="alert" className="text-[13px] text-bad">{error}</p>}
        <button onClick={pass} disabled={!all || busy} className={`${primaryButton} w-full py-3`}>
          {busy ? "Saving…" : last ? "Approve Medico" : `Pass ${step.label.toLowerCase()} → ${VERIFICATION_STEPS[position + 1]!.label}`}
        </button>
        {!all && <p className="text-center text-[12px] text-muted">Tick all {step.checks.length} checks to pass this step.</p>}
      </>
    );
  } else if (record) {
    checklist = (
      <>
        <ul className="grid gap-1">
          {step.checks.map((c) => (
            <li key={c.key} className="flex items-start gap-3 rounded-xl px-3 py-2 text-[13px]">
              <span aria-hidden className="mt-0.5 flex size-4 flex-none items-center justify-center rounded bg-good text-[10px] text-white">✓</span>
              {c.label}
            </li>
          ))}
        </ul>
        <p className="rounded-xl bg-good-soft px-3 py-2.5 text-[12px] text-good">
          Passed by {record.by} on {new Date(record.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
          {record.note && <span className="mt-1 block text-body">“{record.note}”</span>}
        </p>
      </>
    );
  } else {
    checklist = (
      <>
        <ul className="grid gap-1 opacity-60">
          {step.checks.map((c) => (
            <li key={c.key} className="flex items-start gap-3 rounded-xl px-3 py-2 text-[13px]">
              <span aria-hidden className="mt-0.5 size-4 flex-none rounded border border-line" />
              {c.label}
            </li>
          ))}
        </ul>
        <p className="text-center text-[12px] text-muted">{position < current ? "Passed before checklists were recorded." : `Opens after ${VERIFICATION_STEPS[position - 1]?.label.toLowerCase() ?? "the step before"}.`}</p>
      </>
    );
  }

  return (
    <div className="grid gap-5 border-t border-line-soft bg-wash/60 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0">
        <div className="mb-3 text-[12px] tracking-wide text-muted uppercase">What to check</div>
        <StepDetails a={a} stage={step.stage} />
      </div>
      <aside className="flex flex-col gap-3 self-start rounded-xl border border-line bg-white p-4 lg:sticky lg:top-20">
        <div>
          <div className="text-[12px] text-muted">Step {position + 1} of {VERIFICATION_STEPS.length}</div>
          <h4 className="text-[16px] font-medium">{step.label}</h4>
          <p className="mt-0.5 text-[13px] text-body">{step.intro}</p>
        </div>
        {isCurrent && (
          <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
            <div className="h-full rounded-full bg-good transition-[width] duration-300" style={{ width: `${(ticked.length / step.checks.length) * 100}%` }} />
          </div>
        )}
        {checklist}
      </aside>
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: readonly (readonly [string, string])[] }) {
  return (
    <section className="rounded-xl border border-line bg-white">
      <h4 className="border-b border-line-soft px-4 py-2.5 text-[13px] font-medium">{title}</h4>
      <dl className="grid grid-cols-[minmax(120px,40%)_1fr] gap-x-4 gap-y-2 px-4 py-3 text-[13px]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted">{label}</dt>
            <dd className="m-0 wrap-break-word">{value || <span className="text-faint">—</span>}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

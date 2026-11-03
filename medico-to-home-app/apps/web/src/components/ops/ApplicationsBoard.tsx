"use client";

import { PERSONAL_FIELDS, professionByLabel, WORK_FIELDS, type ApplicationDocument, type Details, type Field } from "@medico/shared";
import { useState } from "react";
import { api } from "@/lib/api";
import { Card, Chip, Loading, plainButton, primaryButton, StatusPill, field } from "./ui";
import { useApi } from "./useApi";

const stages = [
  { key: "documents", label: "Documents" },
  { key: "council", label: "Council check" },
  { key: "police", label: "ID and police" },
  { key: "interview", label: "Interview" },
];

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
  if (!data) return <Loading error={error} />;

  const decide = (id: number, action: "pass" | "ask" | "reject") => {
    // Asking for more details or rejecting always tells the applicant why.
    const note = action === "pass" ? "" : prompt(action === "ask" ? "What does the applicant need to fix or send?" : "Reason for rejecting (the applicant will see this):");
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
        const final = index === stages.length - 1;
        const expanded = open === a.id;
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
                  <button onClick={() => decide(a.id, "pass")} className={primaryButton}>{final ? "Approve" : `Pass ${stages[index]?.label.toLowerCase()}`}</button>
                </div>
              )}
            </div>
            {a.decision_note && (waiting || a.stage === "rejected") && (
              <p className="border-t border-line-soft px-5 py-3 text-[13px] text-body">Note to applicant: {a.decision_note}</p>
            )}
            {a.stage !== "rejected" && !waiting && (
              <ol className="grid grid-cols-2 gap-2 border-t border-line-soft px-5 py-4 sm:grid-cols-4">
                {stages.map((s, i) => (
                  <li key={s.key} className={`flex items-center gap-2 text-[13px] ${i <= index ? "text-navy" : "text-faint"}`}>
                    <span aria-hidden className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border text-[11px] ${i < index ? "border-navy bg-navy text-white" : i === index ? "border-navy" : "border-line"}`}>
                      {i < index ? "✓" : i + 1}
                    </span>
                    {s.label}
                  </li>
                ))}
              </ol>
            )}
            <button
              onClick={() => setOpen(expanded ? null : a.id)}
              aria-expanded={expanded}
              className="flex w-full cursor-pointer items-center justify-between border-t border-line-soft px-5 py-3 text-left text-[13px] font-medium text-navy hover:bg-wash"
            >
              {expanded ? "Hide full application" : `View full application · ${a.documents?.length ?? 0} documents`}
              <span aria-hidden className={`transition-transform ${expanded ? "rotate-180" : ""}`}>⌄</span>
            </button>
            {expanded && <FullApplication a={a} />}
          </Card>
        );
      })}
    </div>
  );
}

function FullApplication({ a }: { a: Application }) {
  const profession = professionByLabel(a.profession);
  const d = a.details ?? {};
  const rows = (fields: Field[]) => fields.map((f) => [f.label, show(d[f.key])] as const);
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
    <div className="grid gap-5 border-t border-line-soft bg-wash/60 px-5 py-5 lg:grid-cols-2">
      <Section title="Personal" rows={[["Full name", a.name], ["Gender", a.gender], ["Mobile", a.phone], ["Email", a.email], ["District", a.district], ...rows(PERSONAL_FIELDS)]} />
      <Section title={`${a.profession} details`} rows={rows(profession?.fields ?? [])} />
      <Section title="Work preferences" rows={rows(WORK_FIELDS)} />
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

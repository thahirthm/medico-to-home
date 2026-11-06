"use client";

import { MEDICINES, missingFields, reportTemplate, TESTS, type ReportColumn, type ReportData, type ReportField, type ReportSection, type ReportValue, type RowValue } from "@medico/shared";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Loading } from "../ops/ui";
import { ReportDocument } from "./ReportDocument";

interface Attachment { name: string; path: string; size: number; type: string }
interface Loaded {
  category: string;
  canPrescribe: boolean;
  prescriberNote: string;
  professional: { name: string; role: string; qualification: string; registration: string };
  visit: { id: string; bookingId: string; status: string; mode: string; service: string; bookingNotes: string; when: string; patient: { name: string; age: string; gender: string } };
  defaults: { date: string; time: string; duration: string };
  report: null | { status: "draft" | "submitted"; data: ReportData; summary: string; summarySource: string; attachments: Attachment[]; signedName: string; signedRegistration: string; signedAt: string; updatedAt: string };
}

const input = "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[14px] text-navy outline-none transition-colors placeholder:text-faint focus:border-navy";
const has = (v: ReportValue | undefined) => (Array.isArray(v) ? v.some((r) => Object.values(r).some((x) => x.trim())) : typeof v === "boolean" ? v : !!String(v ?? "").trim());
const time = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });

/** The post-consultation report a Medico writes: their profession's sections, then review, sign and submit. */
export function ReportForm({ visitId }: { visitId: string }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [data, setData] = useState<ReportData>({});
  const [summary, setSummary] = useState("");
  const [summarySource, setSummarySource] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"form" | "review" | "done">("form");
  const [writing, setWriting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [declaration, setDeclaration] = useState(false);
  const [signature, setSignature] = useState("");
  const [problem, setProblem] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const dirty = useRef(false);

  useEffect(() => {
    api<Loaded>(`/pro/visits/${visitId}/report`).then((r) => {
      setLoaded(r);
      setData({ ...r.defaults, ...(r.report?.data ?? {}) });
      setSummary(r.report?.summary ?? "");
      setSummarySource(r.report?.summarySource ?? "");
      setFiles(r.report?.attachments ?? []);
      if (r.report?.status === "submitted") setStep("done");
      // Main sections start open; optional ones (vitals, tests, referrals, private notes) open once they hold something.
      const tpl = reportTemplate(r.category, r.canPrescribe);
      setOpen(new Set(tpl.sections.filter((s) => !s.optional || s.fields.some((f) => has(r.report?.data?.[f.key]))).map((s) => s.key)));
    }).catch((e: Error) => setError(e.message));
  }, [visitId]);

  const tpl = useMemo(() => (loaded ? reportTemplate(loaded.category, loaded.canPrescribe) : null), [loaded]);
  const missing = tpl ? missingFields(tpl, data) : [];

  const save = useCallback(async () => {
    if (!dirty.current || step === "done") return;
    dirty.current = false;
    setSaving(true);
    try {
      await api(`/pro/visits/${visitId}/report`, { method: "PUT", body: { data, summary, summarySource, attachments: files } });
      setSavedAt(new Date());
    } catch (e) {
      dirty.current = true;
      setProblem((e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [visitId, data, summary, summarySource, files, step]);

  // Drafts save themselves a moment after typing stops.
  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(save, 1500);
    return () => clearTimeout(t);
  }, [save]);

  const set = (key: string, value: ReportValue) => {
    dirty.current = true;
    setProblem("");
    setData((d) => {
      const next = { ...d, [key]: value };
      // BMI fills itself from height and weight.
      if ((key === "height" || key === "weight") && tpl?.sections.some((s) => s.fields.some((f) => f.key === "bmi"))) {
        const h = Number(next.height) / 100, w = Number(next.weight);
        if (h > 0 && w > 0) next.bmi = (w / (h * h)).toFixed(1);
      }
      return next;
    });
  };
  const changeSummary = (s: string, source: string) => { dirty.current = true; setSummary(s); setSummarySource(source); };

  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    setUploading(true);
    setProblem("");
    try {
      const added: Attachment[] = [];
      for (const file of [...list].slice(0, 10 - files.length)) {
        const { uploadUrl, path } = await api<{ uploadUrl: string; path: string }>(`/pro/visits/${visitId}/report/files/sign`, { body: { fileName: file.name, size: file.size, type: file.type } });
        const res = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
        if (!res.ok) throw new Error(`Could not upload ${file.name}.`);
        added.push({ name: file.name, path, size: file.size, type: file.type });
      }
      dirty.current = true;
      setFiles((f) => [...f, ...added]);
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setUploading(false);
    }
  };
  const openFile = (path: string) => api<{ url: string }>(`/pro/visits/${visitId}/report/files/url`, { body: { path } }).then((r) => window.open(r.url, "_blank", "noopener")).catch((e: Error) => setProblem(e.message));

  const write = async () => {
    setWriting(true);
    setProblem("");
    try {
      const r = await api<{ summary: string; source: "ai" | "template" }>(`/pro/visits/${visitId}/report/write`, { body: { data } });
      changeSummary(r.summary, r.source);
      if (r.source === "template") setProblem("AI writing is not available right now, so the report was laid out from your entries. You can edit it.");
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setWriting(false);
    }
  };

  const review = async () => {
    setProblem("");
    if (missing.length) {
      setProblem(`Please fill in: ${missing.join(", ")}.`);
      const s = tpl!.sections.find((x) => x.fields.some((f) => missing.includes(f.label)));
      if (s) { setOpen((o) => new Set(o).add(s.key)); document.getElementById(`sec-${s.key}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }
      return;
    }
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!summary.trim()) await write();
  };

  const submit = async () => {
    setSubmitting(true);
    setProblem("");
    try {
      await api(`/pro/visits/${visitId}/report/submit`, { body: { data, summary, summarySource: summarySource || "template", attachments: files, consent, declaration, signature } });
      const r = await api<Loaded>(`/pro/visits/${visitId}/report`);
      setLoaded(r);
      setStep("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!loaded || !tpl) return <Loading error={error} />;
  const v = loaded.visit;

  if (step === "done" && loaded.report) {
    const r = loaded.report;
    return (
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <div className="flex items-center gap-2 text-[13px] text-good"><Tick /> Report submitted and added to {v.patient.name}&apos;s Consultation History</div>
            <h1 className="mt-1 text-2xl font-medium tracking-tight">{tpl.title}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-[13px] hover:border-navy">Download PDF</button>
            <Link href="/pro/visits" className="rounded-full bg-navy px-4 py-2 text-[13px] text-white hover:bg-navy-soft">Back to visits</Link>
          </div>
        </div>
        <ReportDocument
          doc={{ category: loaded.category, data: r.data, summary: r.summary, patient: v.patient, professional: loaded.professional, service: v.service, online: v.mode === "online", visitDate: v.when, bookingId: v.bookingId,
            signed: { name: r.signedName, registration: r.signedRegistration, at: new Date(r.signedAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) },
            files: r.attachments.map((a, i) => ({ i, name: a.name, size: a.size, type: a.type })) }}
          openFile={(i) => openFile(r.attachments[i]!.path)}
        />
        {tpl.sections.some((s) => s.private && s.fields.some((f) => has(r.data[f.key]))) && <p className="text-center text-[12px] text-muted print:hidden">Your private notes are saved with this report and are not shown to the patient.</p>}
      </div>
    );
  }

  const status = saving ? "Saving…" : savedAt ? `Draft saved ${time(savedAt)}` : loaded.report ? "Draft" : "Not saved yet";
  const sectionState = (s: ReportSection) => {
    const req = s.fields.filter((f) => f.required);
    if (req.some((f) => !has(data[f.key]))) return "todo";
    return s.fields.some((f) => has(data[f.key])) ? "done" : "empty";
  };

  return (
    <div className="pb-28 lg:pb-0">
      <Link href="/pro/visits" className="text-[13px] text-muted hover:text-navy">← Visits</Link>

      {/* Patient and visit */}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4 rounded-[20px] border border-line bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-12 flex-none items-center justify-center rounded-full bg-wash text-[17px]">{v.patient.name.slice(0, 1).toUpperCase()}</div>
          <div>
            <div className="text-[17px] font-medium">{v.patient.name}<span className="font-normal text-muted">{[v.patient.age && `, ${v.patient.age} yrs`, v.patient.gender && ` · ${v.patient.gender}`].filter(Boolean).join("")}</span></div>
            <div className="text-[13px] text-muted">{v.service} · {v.when}</div>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-[12px] ${v.mode === "online" ? "bg-[#EAF3FB] text-[#1F6FB2]" : "bg-wash text-body"}`}>{v.mode === "online" ? "Video consultation" : "Home visit"}</span>
        {v.bookingNotes && <p className="basis-full rounded-xl bg-wash px-4 py-3 text-[13px] text-body"><span className="text-muted">Patient&apos;s note when booking: </span>{v.bookingNotes}</p>}
      </div>

      {step === "review" ? (
        <Review
          title={tpl.title} summary={summary} source={summarySource} writing={writing} onWrite={write} onSummary={(s) => changeSummary(s, "edited")}
          consent={consent} setConsent={setConsent} declaration={declaration} setDeclaration={setDeclaration} signature={signature} setSignature={setSignature}
          proName={loaded.professional.name} registration={loaded.professional.registration} problem={problem} submitting={submitting} onBack={() => setStep("form")} onSubmit={submit}
        />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
          <div className="grid gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="text-2xl font-medium tracking-tight">{tpl.title}</h1>
              <span className="text-[12px] text-muted">{status}</span>
            </div>
            {loaded.prescriberNote && <p className="rounded-xl bg-warn-soft px-4 py-3 text-[13px] text-warn">{loaded.prescriberNote}</p>}

            {tpl.sections.map((s) => {
              const isOpen = open.has(s.key);
              const state = sectionState(s);
              return (
                <section key={s.key} id={`sec-${s.key}`} className="scroll-mt-24 rounded-[18px] border border-line bg-white">
                  <button type="button" onClick={() => setOpen((o) => { const n = new Set(o); if (n.has(s.key)) n.delete(s.key); else n.add(s.key); return n; })} aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left">
                    <Dot state={state} />
                    <span className="flex-1 text-[15px] font-medium">{s.title}</span>
                    {s.private && <span className="rounded-full bg-wash px-2 py-0.5 text-[11px] text-muted">Private</span>}
                    {s.patientHeading && !s.private && <span className="hidden rounded-full bg-good-soft px-2 py-0.5 text-[11px] text-good sm:inline">Shared with patient</span>}
                    <span className={`text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}>⌄</span>
                  </button>
                  {isOpen && (
                    <div className="grid gap-4 border-t border-line-soft px-5 pb-5 pt-4 sm:grid-cols-2">
                      {s.fields.map((f) => <FieldInput key={f.key} f={f} value={data[f.key]} onChange={(val) => set(f.key, val)} />)}
                    </div>
                  )}
                </section>
              );
            })}

            {/* Attachments */}
            <section className="rounded-[18px] border border-line bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[15px] font-medium">Attachments</div>
                  <div className="text-[12px] text-muted">Lab reports, scans, wound photos. PDF or photos, up to 20 MB each.</div>
                </div>
                <label className={`cursor-pointer rounded-full border border-line px-4 py-2 text-[13px] hover:border-navy ${uploading || files.length >= 10 ? "pointer-events-none opacity-50" : ""}`}>
                  {uploading ? "Uploading…" : "+ Add files"}
                  <input type="file" multiple accept="application/pdf,image/jpeg,image/png,image/webp,image/heic" className="hidden" onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} />
                </label>
              </div>
              {files.length > 0 && (
                <ul className="mt-3 grid gap-2">
                  {files.map((f, i) => (
                    <li key={f.path} className="flex items-center justify-between gap-3 rounded-xl bg-wash px-3 py-2 text-[13px]">
                      <button type="button" onClick={() => openFile(f.path)} className="min-w-0 cursor-pointer truncate text-left underline-offset-2 hover:underline">{f.name}</button>
                      <button type="button" onClick={() => { dirty.current = true; setFiles((l) => l.filter((_, j) => j !== i)); }} className="cursor-pointer text-muted hover:text-bad" aria-label={`Remove ${f.name}`}>Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            {problem && <p role="alert" className="rounded-xl bg-bad-soft px-4 py-3 text-[13px] text-bad">{problem}</p>}
          </div>

          {/* Progress and actions: a side panel on desktop, a bar on phones */}
          <aside className="hidden lg:sticky lg:top-24 lg:grid lg:gap-3">
            <div className="rounded-[18px] border border-line bg-white p-4">
              <div className="mb-2 text-[12px] font-medium tracking-[.08em] text-muted uppercase">Sections</div>
              <ul className="grid gap-1">
                {tpl.sections.map((s) => (
                  <li key={s.key}>
                    <button type="button" onClick={() => { setOpen((o) => new Set(o).add(s.key)); setTimeout(() => document.getElementById(`sec-${s.key}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-wash">
                      <Dot state={sectionState(s)} small /> <span className="truncate">{s.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <Actions missing={missing.length} saving={saving} onSave={() => { dirty.current = true; void save(); }} onReview={review} />
          </aside>
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
            <Actions missing={missing.length} saving={saving} onSave={() => { dirty.current = true; void save(); }} onReview={review} bar />
          </div>
        </div>
      )}
    </div>
  );
}

function Actions({ missing, saving, onSave, onReview, bar }: { missing: number; saving: boolean; onSave: () => void; onReview: () => void; bar?: boolean }) {
  return (
    <div className={bar ? "flex items-center gap-2" : "grid gap-2 rounded-[18px] border border-line bg-white p-4"}>
      {!bar && <p className="text-[12px] text-muted">{missing ? `${missing} required ${missing === 1 ? "field" : "fields"} left` : "All required fields are filled."}</p>}
      <button type="button" onClick={onSave} disabled={saving} className={`cursor-pointer rounded-full border border-line bg-white px-4 py-2.5 text-[13px] hover:border-navy disabled:opacity-50 ${bar ? "" : "w-full"}`}>Save draft</button>
      <button type="button" onClick={onReview} className={`cursor-pointer rounded-full bg-navy px-4 py-2.5 text-[13px] text-white hover:bg-navy-soft ${bar ? "flex-1" : "w-full"}`}>Review & sign{bar && missing ? ` · ${missing} left` : ""}</button>
    </div>
  );
}

function Review(p: {
  title: string; summary: string; source: string; writing: boolean; onWrite: () => void; onSummary: (s: string) => void;
  consent: boolean; setConsent: (b: boolean) => void; declaration: boolean; setDeclaration: (b: boolean) => void; signature: string; setSignature: (s: string) => void;
  proName: string; registration: string; problem: string; submitting: boolean; onBack: () => void; onSubmit: () => void;
}) {
  return (
    <div className="mx-auto mt-6 grid max-w-3xl gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-medium tracking-tight">Review & sign</h1>
        <button onClick={p.onBack} className="cursor-pointer text-[13px] text-navy underline">Edit details</button>
      </div>

      <section className="rounded-[18px] border border-line bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[15px] font-medium">Written report</div>
            <div className="text-[12px] text-muted">{p.source === "ai" ? "Written by AI from your entries only. Check it before signing." : p.source === "edited" ? "Edited by you." : "Laid out from your entries."}</div>
          </div>
          <button onClick={p.onWrite} disabled={p.writing} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-4 py-2 text-[13px] hover:border-navy disabled:opacity-50">
            <span aria-hidden>✦</span>{p.writing ? "Writing…" : p.summary ? "Rewrite with AI" : "Write with AI"}
          </button>
        </div>
        <textarea value={p.summary} onChange={(e) => p.onSummary(e.target.value)} rows={16} className={`${input} mt-3 font-[inherit] leading-relaxed`} placeholder={p.writing ? "Writing your report…" : "Your report appears here. You can edit it."} />
        <p className="mt-2 text-[12px] text-muted">AI only rewrites what you entered. It never adds findings, diagnoses, medicines or results. If it tries, your own entries are used instead.</p>
      </section>

      <section className="grid gap-3 rounded-[18px] border border-line bg-white p-5">
        <div className="text-[15px] font-medium">Consent & signature</div>
        <label className="flex cursor-pointer items-start gap-3 text-[14px] text-body">
          <input type="checkbox" checked={p.consent} onChange={(e) => p.setConsent(e.target.checked)} className="mt-0.5 size-4 flex-none accent-navy" />
          The patient (or their guardian) consented to this consultation and to this report being shared with them on Medico To Home.
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-[14px] text-body">
          <input type="checkbox" checked={p.declaration} onChange={(e) => p.setDeclaration(e.target.checked)} className="mt-0.5 size-4 flex-none accent-navy" />
          I confirm this report is accurate and within my professional scope.
        </label>
        <label className="grid gap-1.5 text-[13px] text-muted">
          Sign with your full name ({p.proName})
          <input value={p.signature} onChange={(e) => p.setSignature(e.target.value)} className={`${input} text-[16px] italic`} placeholder={p.proName} autoComplete="name" />
        </label>
        {p.registration && <p className="text-[12px] text-muted">Your registration number {p.registration} is added to the signature.</p>}
      </section>

      {p.problem && <p role="alert" className="rounded-xl bg-bad-soft px-4 py-3 text-[13px] text-bad">{p.problem}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={p.onSubmit} disabled={p.submitting || !p.consent || !p.declaration || !p.signature.trim()} className="cursor-pointer rounded-full bg-navy px-6 py-3 text-[14px] text-white hover:bg-navy-soft disabled:cursor-default disabled:opacity-40">
          {p.submitting ? "Submitting…" : "Sign & submit report"}
        </button>
        <span className="text-[12px] text-muted">Once submitted, the report is locked and the visit is completed.</span>
      </div>
    </div>
  );
}

function FieldInput({ f, value, onChange }: { f: ReportField; value: ReportValue | undefined; onChange: (v: ReportValue) => void }) {
  const wide = f.type === "textarea" || f.type === "rows" || f.type === "chips";
  const label = (
    <span className="flex items-baseline justify-between gap-2 text-[13px] text-muted">
      <span>{f.label}{f.required && <span className="text-bad"> *</span>}</span>
      {f.unit && f.type !== "rows" && <span className="text-[12px] text-faint">{f.unit}</span>}
    </span>
  );
  const s = typeof value === "string" ? value : "";
  let control: React.ReactNode;
  switch (f.type) {
    case "textarea":
      control = <textarea value={s} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={f.placeholder} className={`${input} min-h-[84px] resize-y leading-relaxed`} />;
      break;
    case "select":
      control = (
        <select value={s} onChange={(e) => onChange(e.target.value)} className={`${input} cursor-pointer`}>
          <option value="">Choose…</option>
          {f.options!.map((o) => <option key={o}>{o}</option>)}
        </select>
      );
      break;
    case "chips": {
      const on = s ? s.split("|") : [];
      control = (
        <div className="flex flex-wrap gap-2">
          {f.options!.map((o) => {
            const active = on.includes(o);
            return <button key={o} type="button" aria-pressed={active} onClick={() => onChange((active ? on.filter((x) => x !== o) : [...on, o]).join("|"))}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-[13px] transition-colors ${active ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}>{o}</button>;
          })}
        </div>
      );
      break;
    }
    case "check":
      control = <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-navy" />;
      break;
    case "rows":
      control = <RowsInput f={f} rows={Array.isArray(value) ? value : []} onChange={onChange} />;
      break;
    default:
      control = <input type={f.type === "number" ? "text" : f.type} inputMode={f.type === "number" ? "decimal" : undefined} value={s} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} className={input} />;
  }
  // Rows and chips hold their own buttons and inputs, so they sit in a plain box rather than a label.
  const Box = f.type === "rows" || f.type === "chips" ? "div" : "label";
  return (
    <Box className={`grid content-start gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      {f.type !== "rows" && label}
      {control}
      {f.hint && <span className="text-[12px] text-faint">{f.hint}</span>}
    </Box>
  );
}

const WIDTH = { s: "sm:w-24", m: "sm:w-36", l: "sm:min-w-0 sm:flex-[2]" } as const;

/** Add/remove rows: prescriptions, tests, exercises, results. Medicine and test columns search the built-in lists. */
function RowsInput({ f, rows, onChange }: { f: ReportField; rows: RowValue[]; onChange: (v: ReportValue) => void }) {
  const cols = f.columns!;
  const blank = () => Object.fromEntries(cols.map((c) => [c.key, ""]));
  const list = rows.length ? rows : [blank()];
  const edit = (i: number, key: string, val: string) => onChange(list.map((r, j) => (j === i ? { ...r, [key]: val } : r)));
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-muted">{f.label}</span>
        <span className="text-[12px] text-faint">{list.filter((r) => Object.values(r).some((x) => x.trim())).length} added</span>
      </div>
      {list.map((r, i) => (
        <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-line-soft bg-wash/60 p-2.5 sm:flex sm:flex-wrap sm:items-end">
          {cols.map((c) => (
            <label key={c.key} className={`grid gap-1 ${c.width === "l" ? "col-span-2" : ""} sm:flex-1 ${WIDTH[c.width ?? "m"]}`}>
              <span className="text-[11px] text-muted">{c.label}</span>
              <Cell c={c} value={r[c.key] ?? ""} onChange={(v) => edit(i, c.key, v)} />
            </label>
          ))}
          <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Remove row"
            className="col-span-2 cursor-pointer justify-self-end px-2 py-1.5 text-[12px] text-muted hover:text-bad sm:self-end">Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...list, blank()])} className="cursor-pointer justify-self-start rounded-full border border-dashed border-line px-3.5 py-1.5 text-[13px] text-navy hover:border-navy">+ Add {f.label.toLowerCase().replace(/s$/, "")}</button>
    </div>
  );
}

function Cell({ c, value, onChange }: { c: ReportColumn; value: string; onChange: (v: string) => void }) {
  const cls = "w-full rounded-lg border border-line bg-white px-2.5 py-2 text-[14px] text-navy outline-none focus:border-navy";
  if (c.kind === "select") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${cls} cursor-pointer`}>
        <option value="">—</option>
        {c.options!.map((o) => <option key={o}>{o}</option>)}
      </select>
    );
  }
  const listId = c.kind === "medicine" ? "mth-medicines" : c.kind === "test" ? "mth-tests" : undefined;
  return <input value={value} onChange={(e) => onChange(e.target.value)} list={listId} className={cls} placeholder={c.kind === "medicine" ? "Search medicines" : c.kind === "test" ? "Search tests" : ""} />;
}

/** The searchable medicine and test lists, once per page. */
export function ClinicalLists() {
  return (
    <>
      <datalist id="mth-medicines">{MEDICINES.map((m) => <option key={m} value={m} />)}</datalist>
      <datalist id="mth-tests">{TESTS.map((t) => <option key={t} value={t} />)}</datalist>
    </>
  );
}

function Dot({ state, small }: { state: string; small?: boolean }) {
  const size = small ? "size-4 text-[9px]" : "size-5 text-[11px]";
  if (state === "done") return <span className={`flex ${size} flex-none items-center justify-center rounded-full bg-good text-white`}>✓</span>;
  if (state === "todo") return <span className={`${size} flex-none rounded-full border-2 border-[#E2A33B]`} title="Required fields left" />;
  return <span className={`${size} flex-none rounded-full border border-line`} />;
}

const Tick = () => <span className="flex size-4 items-center justify-center rounded-full bg-good text-[10px] text-white">✓</span>;

"use client";

import {
  GENDERS, missingForApplication, PERSONAL_FIELDS, PROFESSIONS, professionByLabel, WORK_FIELDS,
  type ApplicationDocument, type Details, type DocumentSpec, type Field,
} from "@medico/shared";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSite } from "@/components/site/SiteProvider";
import { api } from "@/lib/api";
import { MTH } from "@/prototype/catalogue";

const STEPS = ["Profession", "About you", "Qualifications", "Work", "Documents", "Review"];
const GROUPS = [...new Set(PROFESSIONS.map((p) => p.group))];
const IN_REVIEW: Record<string, string> = {
  documents: "Checking your documents",
  council: "Checking your council registration",
  police: "ID and police clearance check",
  interview: "Interview",
};

const input = "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] font-light text-navy outline-none focus:border-navy";
const primary = "cursor-pointer rounded-full bg-navy px-7 py-3.5 text-[15px] font-semibold text-white hover:bg-navy-soft disabled:cursor-default disabled:opacity-50";
const secondary = "cursor-pointer rounded-full border border-line bg-white px-6 py-3.5 text-[15px] text-navy hover:border-navy";

interface Draft {
  profession: string;
  name: string;
  phone: string;
  gender: string;
  district: string;
  details: Details;
  documents: ApplicationDocument[];
}

interface Existing extends Draft {
  stage: string;
  decision_note: string;
}

const blank: Draft = { profession: "", name: "", phone: "", gender: "", district: "Kozhikode", details: {}, documents: [] };
const isEmpty = (v: unknown) => (Array.isArray(v) ? v.length === 0 : !v || !String(v).trim());
const size = (bytes: number) => (bytes > 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

export function ApplyForm() {
  const site = useSite();
  // A brand-new account finishes its setup in the login popup first.
  const me = site.me && !site.me.needs_setup ? (site.me as { id: string; full_name: string; phone: string | null; professional: unknown }) : null;
  const [existing, setExisting] = useState<Existing | null | undefined>(undefined);
  const [draft, setDraft] = useState<Draft>(blank);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [sent, setSent] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const draftKey = me ? `mth-apply-${me.id}` : "";

  // Start from: the saved draft on this device, else the last application (when it needs changes), else the account details.
  useEffect(() => {
    if (!me) return;
    let live = true;
    api<Existing | null>("/applications/mine")
      .then((app) => {
        if (!live) return;
        setExisting(app);
        let saved: Draft | null = null;
        try {
          saved = JSON.parse(localStorage.getItem(draftKey) || "null");
        } catch {}
        if (saved) setDraft(saved);
        else if (app && ["info_needed", "rejected"].includes(app.stage)) setDraft({ ...blank, ...app, details: app.details ?? {}, documents: app.documents ?? [] });
        else setDraft((d) => ({ ...d, name: d.name || me.full_name || "", phone: d.phone || me.phone || "" }));
      })
      .catch((e: Error) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [me, draftKey]);

  useEffect(() => {
    if (!draftKey || existing === undefined || sent) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {}
  }, [draft, draftKey, existing, sent]);

  const profession = professionByLabel(draft.profession);
  const localities = useMemo(
    () => Object.entries(MTH.LOCS as Record<string, [number, number, string, string]>).filter(([, l]) => l[2] === draft.district).map(([name]) => name),
    [draft.district],
  );

  const set = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setError("");
  };
  const setDetail = (key: string, value: string | string[]) => set({ details: { ...draft.details, [key]: value } });

  const stepFields: Field[][] = [[], PERSONAL_FIELDS, profession?.fields ?? [], WORK_FIELDS];
  const stepMissing = (i: number): string[] => {
    if (i === 0) return draft.profession ? [] : ["Profession"];
    if (i === 1) {
      const base = [
        draft.name.trim().length < 2 && "Full name",
        !/^(\+?91)?\s*\d{10}$/.test(draft.phone.trim()) && "Mobile number",
        !draft.gender && "Gender",
      ].filter(Boolean) as string[];
      return [...base, ...PERSONAL_FIELDS.filter((f) => f.required && isEmpty(draft.details[f.key])).map((f) => f.label)];
    }
    if (i <= 3) return stepFields[i].filter((f) => f.required && isEmpty(draft.details[f.key])).map((f) => f.label);
    if (i === 4) return (profession?.documents ?? []).filter((d) => d.required && !draft.documents.some((x) => x.kind === d.key)).map((d) => d.label);
    return [];
  };

  const goTo = (i: number) => {
    setStep(i);
    setError("");
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const next = () => {
    const missing = stepMissing(step);
    if (missing.length) return setError(`Please complete: ${missing.join(", ")}.`);
    goTo(step + 1);
  };

  const submit = async () => {
    const missing = [...stepMissing(1), ...missingForApplication(draft.profession, draft.details, draft.documents)];
    if (missing.length) return setError(`Please complete: ${[...new Set(missing)].join(", ")}.`);
    if (!agreed) return setError("Please confirm the declaration.");
    setBusy(true);
    try {
      const resend = existing?.stage === "info_needed";
      await api(resend ? "/applications/mine" : "/applications", { method: resend ? "PUT" : "POST", body: draft });
      try {
        localStorage.removeItem(draftKey);
      } catch {}
      setSent(true);
      top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };

  // Screens before the form.
  if (!site.authReady) return <Shell><p className="text-muted">Loading…</p></Shell>;
  if (!me) {
    return (
      <Shell>
        <Heading light="Apply to" bold="join" />
        <p className="max-w-xl text-[16px] leading-relaxed text-muted">Log in with Google first. Your application, documents and later your visits and earnings all stay on this one account.</p>
        <button onClick={site.openLogin} className={`${primary} self-start`}>Log in to apply</button>
      </Shell>
    );
  }
  if (existing === undefined) return <Shell><p className="text-muted">{error || "Loading your application…"}</p></Shell>;
  if (sent) {
    return (
      <Shell>
        <span className="flex h-13 w-13 items-center justify-center rounded-full bg-good-soft text-2xl text-good" aria-hidden>✓</span>
        <Heading light="Thank you." bold="We’ll call you." />
        <p className="max-w-xl text-[16px] leading-relaxed text-muted">Our onboarding team checks your documents and calls you within 2 working days to set up verification. You can see progress on the For Professionals page.</p>
        <Link href="/join" className={`${secondary} self-start`}>Back to For Professionals</Link>
      </Shell>
    );
  }
  if (me.professional || existing?.stage === "approved") {
    return (
      <Shell>
        <Heading light="You are" bold="approved." />
        <p className="text-[16px] text-muted">Open the professional app to see your visits, schedule and earnings.</p>
        <a href="/pro" className={`${primary} self-start`}>Open professional app</a>
      </Shell>
    );
  }
  if (existing && IN_REVIEW[existing.stage]) {
    return (
      <Shell>
        <Heading light="Application" bold="in review" />
        <p className="text-[16px] text-muted">
          {existing.profession} · Current step: <span className="text-navy">{IN_REVIEW[existing.stage]}</span>. We will call you on {existing.phone}.
        </p>
      </Shell>
    );
  }

  return (
    <div ref={top} className="mx-auto flex w-full max-w-220 scroll-mt-24 flex-col gap-7 px-[clamp(18px,4vw,48px)] pb-[clamp(64px,8vw,120px)] pt-[clamp(36px,5vw,72px)]">
      <div className="flex flex-col gap-3">
        <span className="text-[13px] font-medium uppercase tracking-[.08em] text-muted">Professional application</span>
        <Heading light={STEPS[step]} bold={step === 0 ? "" : profession ? `· ${profession.label}` : ""} />
      </div>

      <Progress step={step} onPick={(i) => i < step && goTo(i)} />

      {existing && existing.decision_note && ["info_needed", "rejected"].includes(existing.stage) && (
        <div role="status" className="rounded-2xl bg-warn-soft px-4 py-3.5 text-[15px] leading-relaxed text-warn">
          <strong className="font-semibold">{existing.stage === "info_needed" ? "We need a few more details." : "Your last application was not approved."}</strong> {existing.decision_note}
        </div>
      )}

      {step === 0 && (
        <div className="flex flex-col gap-7">
          {GROUPS.map((group) => (
            <section key={group} className="flex flex-col gap-3">
              <h3 className="text-[13px] font-medium text-muted">{group}</h3>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {PROFESSIONS.filter((p) => p.group === group).map((p) => {
                  const on = draft.profession === p.label;
                  return (
                    <button
                      key={p.label}
                      onClick={() => set({ profession: p.label, documents: on ? draft.documents : draft.documents.filter((d) => p.documents.some((s) => s.key === d.kind)) })}
                      aria-pressed={on}
                      className={`flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 text-left transition-colors ${on ? "border-navy bg-wash" : "border-line bg-white hover:border-navy"}`}
                    >
                      <span className="flex items-center justify-between gap-2 text-[16px] font-medium">
                        {p.label}
                        <span aria-hidden className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border text-[11px] ${on ? "border-navy bg-navy text-white" : "border-line"}`}>{on ? "✓" : ""}</span>
                      </span>
                      <span className="text-[13px] leading-snug text-muted">{p.blurb}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {step === 1 && (
        <Grid>
          <Labelled label="Full name" required>
            <input className={input} value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="As on your certificates" autoComplete="name" />
          </Labelled>
          <Labelled label="Mobile number" required>
            <input className={input} value={draft.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="10-digit number" inputMode="tel" autoComplete="tel" />
          </Labelled>
          <Labelled label="Gender" required>
            <Chips options={GENDERS} value={draft.gender} onChange={(v) => set({ gender: v as string })} />
          </Labelled>
          <Labelled label="District" required>
            <Chips options={["Kozhikode", "Malappuram"]} value={draft.district} onChange={(v) => set({ district: v as string, details: { ...draft.details, locality: "" } })} />
          </Labelled>
          {PERSONAL_FIELDS.map((f) => (
            <FieldInput key={f.key} field={f.key === "locality" ? { ...f, options: localities } : f} value={draft.details[f.key]} onChange={(v) => setDetail(f.key, v)} />
          ))}
        </Grid>
      )}

      {(step === 2 || step === 3) && (
        <Grid>
          {stepFields[step].map((f) => (
            <FieldInput key={f.key} field={f} value={draft.details[f.key]} onChange={(v) => setDetail(f.key, v)} />
          ))}
        </Grid>
      )}

      {step === 4 && profession && (
        <div className="flex flex-col gap-3">
          <p className="text-[15px] leading-relaxed text-muted">Photos or PDFs, up to 20 MB each. Files are private: only our verification team can open them.</p>
          {profession.documents.map((spec) => (
            <DocumentRow
              key={spec.key}
              spec={spec}
              file={draft.documents.find((d) => d.kind === spec.key)}
              onChange={(file) => set({ documents: [...draft.documents.filter((d) => d.kind !== spec.key), ...(file ? [file] : [])] })}
              onError={setError}
            />
          ))}
        </div>
      )}

      {step === 5 && profession && (
        <div className="flex flex-col gap-4">
          <Summary title="Profession" onEdit={() => goTo(0)} rows={[["Applying as", draft.profession]]} />
          <Summary
            title="About you"
            onEdit={() => goTo(1)}
            rows={[["Name", draft.name], ["Mobile", draft.phone], ["Gender", draft.gender], ["District", draft.district], ...PERSONAL_FIELDS.map((f) => [f.label, draft.details[f.key]] as const)]}
          />
          <Summary title="Qualifications" onEdit={() => goTo(2)} rows={profession.fields.map((f) => [f.label, draft.details[f.key]] as const)} />
          <Summary title="Work" onEdit={() => goTo(3)} rows={WORK_FIELDS.map((f) => [f.label, draft.details[f.key]] as const)} />
          <Summary title="Documents" onEdit={() => goTo(4)} rows={profession.documents.map((d) => [d.label, draft.documents.find((x) => x.kind === d.key)?.fileName ?? ""] as const)} />
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4 text-[14px] leading-relaxed text-body">
            <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setError(""); }} className="mt-1 h-4 w-4 flex-none accent-navy" />
            I confirm these details and documents are true. I agree to background, council and police verification, and understand that false information ends my application.
          </label>
        </div>
      )}

      {error && <p role="alert" className="text-[14px] text-bad">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 border-t border-line-soft pt-6">
        {step > 0 && <button onClick={() => goTo(step - 1)} className={secondary}>Back</button>}
        {step < STEPS.length - 1 ? (
          <button onClick={next} className={primary}>Continue</button>
        ) : (
          <button onClick={submit} disabled={busy} className={primary}>{busy ? "Sending…" : existing?.stage === "info_needed" ? "Send updated application" : "Submit application"}</button>
        )}
        <span className="ml-auto text-[13px] text-faint">Saved on this device as you type</span>
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex w-full max-w-220 flex-col gap-5 px-[clamp(18px,4vw,48px)] py-[clamp(56px,8vw,120px)]">{children}</div>;
}

function Heading({ light, bold }: { light: string; bold: string }) {
  return (
    <h1 className="m-0 text-[clamp(30px,4.4vw,52px)] font-light leading-[1.05] tracking-[-.035em]">
      {light} {bold && <span className="font-semibold">{bold}</span>}
    </h1>
  );
}

function Progress({ step, onPick }: { step: number; onPick: (i: number) => void }) {
  return (
    <ol className="grid grid-cols-6 gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
      {STEPS.map((s, i) => (
        <li key={s} className="flex flex-col gap-2">
          <button onClick={() => onPick(i)} disabled={i >= step} aria-label={`${s}${i < step ? " (done, edit)" : ""}`} className={`h-1.5 rounded-full ${i <= step ? "bg-navy" : "bg-line"} ${i < step ? "cursor-pointer" : "cursor-default"}`} />
          <span className={`hidden text-[12px] sm:block ${i === step ? "text-navy" : "text-faint"}`}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">{children}</div>;
}

function Labelled({ label, required, hint, wide, children }: { label: string; required?: boolean; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-[13px] text-body">
        {label}
        {!required && <span className="text-faint"> · optional</span>}
      </span>
      {children}
      {hint && <span className="text-[12px] leading-snug text-muted">{hint}</span>}
    </div>
  );
}

function Chips({ options, value, onChange, multi }: { options: string[]; value: string | string[] | undefined; onChange: (v: string | string[]) => void; multi?: boolean }) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = list.includes(o);
        return (
          <button
            type="button"
            key={o}
            aria-pressed={on}
            onClick={() => onChange(multi ? (on ? list.filter((x) => x !== o) : [...list, o]) : o)}
            className={`min-h-10 cursor-pointer rounded-full border px-3.5 py-2 text-[14px] transition-colors ${on ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function FieldInput({ field: f, value, onChange }: { field: Field; value: string | string[] | undefined; onChange: (v: string | string[]) => void }) {
  const str = typeof value === "string" ? value : "";
  const wide = f.type === "multi" || f.type === "textarea" || (f.type === "select" && (f.options?.length ?? 0) > 4 && f.key !== "locality");
  let control: React.ReactNode;
  if (f.type === "multi") control = <Chips multi options={f.options ?? []} value={value} onChange={onChange} />;
  else if (f.type === "select" && (f.options?.length ?? 0) <= 4) control = <Chips options={f.options ?? []} value={value} onChange={onChange} />;
  else if (f.type === "select")
    control = (
      <select className={input} value={str} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose…</option>
        {f.options?.map((o) => <option key={o}>{o}</option>)}
      </select>
    );
  else if (f.type === "textarea") control = <textarea className={`${input} min-h-24 resize-y`} value={str} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} maxLength={1000} />;
  else control = <input className={input} type={f.type === "number" ? "text" : f.type} inputMode={f.type === "number" ? "numeric" : undefined} value={str} onChange={(e) => onChange(f.type === "number" ? e.target.value.replace(/\D/g, "") : e.target.value)} placeholder={f.placeholder} />;
  return <Labelled label={f.label} required={f.required} hint={f.hint} wide={wide}>{control}</Labelled>;
}

function DocumentRow({ spec, file, onChange, onError }: { spec: DocumentSpec; file?: ApplicationDocument; onChange: (f: ApplicationDocument | null) => void; onError: (m: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const pick = () => {
    const el = document.createElement("input");
    el.type = "file";
    el.accept = ".pdf,image/*";
    el.onchange = async () => {
      const f = el.files?.[0];
      if (!f) return;
      setUploading(true);
      onError("");
      try {
        const { uploadUrl, path } = await api<{ uploadUrl: string; path: string }>("/applications/documents/sign", { body: { kind: spec.key, fileName: f.name, size: f.size } });
        const up = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": f.type || "application/octet-stream" }, body: f });
        if (!up.ok) throw new Error("Upload failed. Please try again.");
        onChange({ kind: spec.key, fileName: f.name, path, size: f.size });
      } catch (e) {
        onError((e as Error).message);
      }
      setUploading(false);
    };
    el.click();
  };
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line p-4">
      <span aria-hidden className={`flex h-9 w-9 flex-none items-center justify-center rounded-full text-[14px] ${file ? "bg-good-soft text-good" : "bg-wash text-faint"}`}>{file ? "✓" : "↑"}</span>
      <div className="flex min-w-0 flex-1 basis-48 flex-col gap-0.5">
        <span className="text-[15px] font-medium">
          {spec.label}
          {!spec.required && <span className="font-normal text-faint"> · optional</span>}
        </span>
        <span className="truncate text-[13px] text-muted">{file ? `${file.fileName} · ${size(file.size)}` : spec.hint ?? (spec.required ? "Required" : "")}</span>
      </div>
      <div className="flex gap-2">
        {file && <button onClick={() => onChange(null)} className="min-h-10 cursor-pointer px-2 text-[14px] text-muted underline underline-offset-2 hover:text-navy">Remove</button>}
        <button onClick={pick} disabled={uploading} className="min-h-10 cursor-pointer rounded-full border border-line px-4 text-[14px] text-navy hover:border-navy disabled:opacity-60">
          {uploading ? "Uploading…" : file ? "Replace" : "Upload"}
        </button>
      </div>
    </div>
  );
}

function Summary({ title, rows, onEdit }: { title: string; rows: readonly (readonly [string, string | string[] | undefined])[]; onEdit: () => void }) {
  return (
    <section className="rounded-2xl border border-line">
      <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
        <h3 className="text-[15px] font-medium">{title}</h3>
        <button onClick={onEdit} className="min-h-9 cursor-pointer px-1 text-[14px] text-navy underline underline-offset-2">Edit</button>
      </div>
      <dl className="grid gap-x-6 gap-y-2.5 px-4 py-3.5 text-[14px] sm:grid-cols-[minmax(160px,auto)_1fr]">
        {rows.map(([label, v]) => (
          <div key={label} className="contents">
            <dt className="text-muted">{label}</dt>
            <dd className="m-0 wrap-break-word text-navy">{(Array.isArray(v) ? v.join(", ") : v) || <span className="text-faint">—</span>}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

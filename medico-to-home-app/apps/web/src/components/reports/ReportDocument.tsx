"use client";

import { reportTemplate, type ReportData, type ReportField, type RowValue } from "@medico/shared";
import Image from "next/image";

export interface ReportDoc {
  category: string;
  data: ReportData;
  summary: string;
  patient: { name: string; age: string; gender: string };
  professional: { name: string; role: string; qualification?: string };
  service: string;
  online: boolean;
  visitDate: string;
  bookingId: string;
  signed: { name: string; registration: string; at: string };
  files: { i: number; name: string; size: number; type: string }[];
}

const has = (v: unknown) => (Array.isArray(v) ? v.length > 0 : !!String(v ?? "").trim());
const size = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const longDate = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

/** A finished consultation report: the written report first, then the lists the patient acts on. Prints as the PDF. */
export function ReportDocument({ doc, openFile }: { doc: ReportDoc; openFile?: (i: number) => void }) {
  const tpl = reportTemplate(doc.category, true);
  const d = doc.data;
  // Sections with their own heading for the patient (prescription, tests, plans), when something was entered.
  const lists = tpl.sections.filter((s) => s.patientHeading && !s.private && s.key !== "followup").map((s) => ({ s, fields: s.fields.filter((f) => has(d[f.key])) })).filter((x) => x.fields.length);
  const follow = tpl.sections.find((s) => s.key === "followup");

  return (
    <article className="report-doc mx-auto w-full max-w-3xl rounded-[24px] border border-line bg-white print:max-w-none print:rounded-none print:border-0">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-9">
        <Image src="/brand/logo.svg" alt="Medico To Home" width={150} height={36} className="h-9 w-auto" unoptimized priority />
        <div className="text-right text-[12px] leading-relaxed text-muted">
          <div className="text-[13px] font-medium text-navy">{tpl.title}</div>
          <div>Booking {doc.bookingId}</div>
          <div>{doc.visitDate}{doc.online ? " · Video consultation" : " · Home visit"}</div>
        </div>
      </header>

      <div className="grid gap-px border-b border-line bg-line sm:grid-cols-2">
        <Who label="Patient" name={doc.patient.name} sub={[doc.patient.age && `${doc.patient.age} yrs`, doc.patient.gender].filter(Boolean).join(" · ")} />
        <Who label={doc.professional.role} name={doc.professional.name} sub={[doc.professional.qualification, doc.service].filter(Boolean).join(" · ")} />
      </div>

      <div className="grid gap-8 px-6 py-7 sm:px-9">
        {doc.summary && (
          <section>
            <H>Consultation report</H>
            <div className="mt-3 grid gap-1 text-[14px] leading-relaxed text-ink">
              {doc.summary.split("\n").map((line, i) =>
                /^[A-Z][A-Z0-9 &/(),·'-]{2,}:?$/.test(line.trim())
                  ? <div key={i} className="mt-3 text-[12px] font-medium tracking-[.08em] text-navy first:mt-0">{line.trim().replace(/:$/, "")}</div>
                  : line.trim() ? <p key={i} className={line.trim().startsWith("- ") ? "pl-4 -indent-3" : ""}>{line.trim().startsWith("- ") ? `• ${line.trim().slice(2)}` : line}</p> : null,
              )}
            </div>
          </section>
        )}

        {lists.map(({ s, fields }) => (
          <section key={s.key} className="break-inside-avoid">
            <H>{s.patientHeading}</H>
            <div className="mt-3 grid gap-3">
              {fields.map((f) => (f.type === "rows" ? <Rows key={f.key} f={f} rows={d[f.key] as RowValue[]} /> : <Pair key={f.key} f={f} v={d[f.key]} />))}
            </div>
          </section>
        ))}

        {follow && follow.fields.some((f) => has(d[f.key])) && (
          <section className="break-inside-avoid rounded-2xl bg-wash p-5">
            <H>Follow-up</H>
            <div className="mt-3 grid gap-2 text-[14px] text-ink">
              {has(d.next) && <div className="text-[15px] text-navy">Next appointment: <strong className="font-medium">{longDate(String(d.next))}</strong>{has(d.nextNote) && ` · ${d.nextNote}`}</div>}
              {has(d.instructions) && <p className="whitespace-pre-line">{String(d.instructions)}</p>}
              {has(d.remarks) && <p className="whitespace-pre-line text-muted">{String(d.remarks)}</p>}
            </div>
          </section>
        )}

        {doc.files.length > 0 && (
          <section className="break-inside-avoid">
            <H>Attached reports & images</H>
            <ul className="mt-3 grid gap-2">
              {doc.files.map((f) => (
                <li key={f.i} className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 text-[14px]">
                  <span className="min-w-0 truncate">{f.name} <span className="text-faint">· {size(f.size)}</span></span>
                  {openFile && <button onClick={() => openFile(f.i)} className="cursor-pointer text-[13px] text-navy underline print:hidden">Open</button>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className="flex flex-wrap items-end justify-between gap-4 border-t border-line px-6 py-5 sm:px-9">
        <div className="text-[13px] leading-relaxed">
          <div className="text-[12px] text-muted">Digitally signed by</div>
          <div className="font-medium text-navy">{doc.signed.name}</div>
          {doc.signed.registration && <div className="text-muted">Reg. no. {doc.signed.registration}</div>}
          <div className="text-muted">{doc.signed.at}</div>
        </div>
        <p className="max-w-xs text-right text-[11px] leading-relaxed text-faint">Issued through Medico To Home. For emergencies call 108. Do not change medicines without asking your doctor.</p>
      </footer>
    </article>
  );
}

function Who({ label, name, sub }: { label: string; name: string; sub: string }) {
  return (
    <div className="bg-white px-6 py-4 sm:px-9">
      <div className="text-[11px] font-medium tracking-[.08em] text-muted uppercase">{label}</div>
      <div className="mt-0.5 text-[16px] font-medium">{name}</div>
      {sub && <div className="text-[13px] text-muted">{sub}</div>}
    </div>
  );
}

const H = ({ children }: { children: React.ReactNode }) => <h2 className="text-[12px] font-medium tracking-[.1em] text-muted uppercase">{children}</h2>;

function Pair({ f, v }: { f: ReportField; v: unknown }) {
  const text = f.type === "chips" ? String(v).split("|").join(", ") : `${String(v)}${f.unit ? ` ${f.unit}` : ""}`;
  return (
    <div className="grid gap-0.5 text-[14px] sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
      <div className="text-muted">{f.label}</div>
      <div className="whitespace-pre-line text-ink">{text}</div>
    </div>
  );
}

function Rows({ f, rows }: { f: ReportField; rows: RowValue[] }) {
  const cols = f.columns!.filter((c) => rows.some((r) => r[c.key]));
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[480px] text-left text-[13px]">
        <thead className="bg-wash text-[12px] text-muted">
          <tr>{cols.map((c) => <th key={c.key} className="px-3 py-2 font-normal">{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line-soft align-top">
              {cols.map((c, j) => <td key={c.key} className={`px-3 py-2.5 ${j === 0 ? "font-medium text-navy" : "text-ink"}`}>{r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

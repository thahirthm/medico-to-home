import Anthropic from "@anthropic-ai/sdk";
import { cleanReport, missingFields, plainReport, PRESCRIBERS, reportFacts, reportTemplate, type ReportData, type ReportTemplate } from "@medico/shared";
import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { audit, requireUser, type User } from "../auth";
import { pool } from "../db";
import { env } from "../env";
import { ApiError } from "../errors";
import { formatIst } from "../time";
import { BUCKET, MAX_BYTES, safeFileName, signedDownload, signedUpload } from "../storage";
import { completeVisit, professional } from "./pro";

const REPORT_MODEL = "claude-opus-5-5";
const MAX_FILES = 10;
const FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"];

const anthropic = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;

const REPORT_SYSTEM = `You turn a healthcare professional's structured consultation notes into a clear, professional clinical report for Medico To Home, a home-healthcare service in Kerala, India. The patient, their family and other clinicians read it.

Rules:
- Use only the facts in the JSON. Never add, infer or guess findings, diagnoses, medicines, doses, test results, vitals, advice or follow-up dates that are not there. If something is missing, leave it out; never write "not recorded" or fill gaps.
- Keep every medicine name, dose, frequency, duration, route, test name, number and unit exactly as given.
- Keep the professional's meaning. You may fix grammar, write notes as full sentences and order the content clearly.
- Plain text only. Each section heading in UPPER CASE on its own line, followed by short sentences or lines starting with "- ". No markdown symbols such as # or **.
- No greeting, title line, sign-off, signature, or patient contact details.`;

// Every number the AI writes must already be in what the professional entered, so it cannot invent doses or results.
const numbersFrom = (text: string) => text.match(/\d+(?:[.,/]\d+)*/g) ?? [];
const numbersKept = (report: string, source: string) => numbersFrom(report).every((n) => source.includes(n));

async function writeReport(tpl: ReportTemplate, data: ReportData, role: string, log: { warn: (o: unknown, m: string) => void }) {
  const plain = { summary: plainReport(tpl, data), source: "template" as const };
  const facts = reportFacts(tpl, data);
  if (!anthropic || !facts.length) return plain;
  const input = JSON.stringify({ report: tpl.title, profession: role, sections: facts });
  try {
    const response = await anthropic.beta.messages.create({
      model: REPORT_MODEL,
      max_tokens: 6000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: REPORT_SYSTEM,
      messages: [{ role: "user", content: input }],
    });
    if (response.stop_reason === "refusal") return plain;
    const summary = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
    if (!summary || summary.length > 12000) return plain;
    if (!numbersKept(summary, input)) {
      log.warn({}, "AI report added a number that was not entered; used the plain report");
      return plain;
    }
    return { summary, source: "ai" as const };
  } catch (error) {
    if (error instanceof Anthropic.APIError || error instanceof Anthropic.APIConnectionError) log.warn({ error: error.message }, "AI report unavailable, used the plain report");
    else throw error;
    return plain;
  }
}

const attachment = z.object({ name: z.string().min(1).max(200), path: z.string().max(400), size: z.number().int().nonnegative(), type: z.string().max(100).default("") });
const draftBody = z.object({
  data: z.record(z.string(), z.unknown()).default({}),
  summary: z.string().max(12000).default(""),
  summarySource: z.enum(["", "ai", "template", "edited"]).default(""),
  attachments: z.array(attachment).max(MAX_FILES, `Up to ${MAX_FILES} files.`).default([]),
});

/** The visit, its booking and patient, for the professional who holds it. */
async function visitFor(user: User, visitId: string) {
  const pro = await professional(user);
  const { rows } = await pool.query(
    `select v.id, v.booking_id, v.starts_at, v.ends_at, v.status, b.patient_id, b.owner_id, b.patient_name, b.service_name, b.mode, b.notes booking_notes,
       pa.age, pa.gender, r.id report_id, r.status report_status, r.data, r.summary, r.summary_source, r.attachments, r.consent, r.signed_name, r.signed_registration, r.signed_at, r.updated_at
     from visits v join bookings b on b.id = v.booking_id left join patients pa on pa.id = b.patient_id left join consultation_reports r on r.visit_id = v.id
     where v.id = $1 and v.professional_id = $2`,
    [visitId, pro.id],
  );
  const visit = rows[0];
  if (!visit) throw new ApiError(404, "Visit not found.");
  // Prescriptions and clinical orders only from a doctor or dentist with a registration number on file.
  const canPrescribe = PRESCRIBERS.includes(pro.category_key) && !!String(pro.registration_no ?? "").trim();
  return { pro, visit, canPrescribe, tpl: reportTemplate(pro.category_key, canPrescribe) };
}

const ownAttachments = (visitId: string, list: z.infer<typeof attachment>[]) => {
  if (list.some((a) => !a.path.startsWith(`reports/${visitId}/`))) throw new ApiError(400, "Invalid file.");
  return list;
};

const minutes = (a: Date, b: Date) => Math.max(5, Math.round((b.getTime() - a.getTime()) / 60_000));
const sameName = (a: string, b: string) => {
  const n = (s: string) => s.toLowerCase().replace(/^dr\.?\s*/, "").replace(/[^a-z]/g, "");
  return n(a) === n(b);
};
/** The one line that sums a report up: what the patient sees in their timeline. */
const headline = (d: ReportData) => String(d.diagnosis || d.assessment || d.review || d.complaint || "").split("\n")[0]!.slice(0, 160);

/** Removes what the patient must not see: private sections (a psychologist's own notes). */
function forPatient(category: string, data: ReportData) {
  const hidden = new Set(reportTemplate(category, true).sections.filter((s) => s.private).flatMap((s) => s.fields.map((f) => f.key)));
  return Object.fromEntries(Object.entries(data).filter(([k]) => !hidden.has(k)));
}

export async function reportRoutes(app: FastifyInstance) {
  // The report form: the template for this professional, the visit's details, and any draft saved so far.
  app.get<{ Params: { id: string } }>("/pro/visits/:id/report", async (request) => {
    const user = await requireUser(request);
    const { pro, visit, canPrescribe } = await visitFor(user, request.params.id);
    const starts = new Date(visit.starts_at), ends = new Date(visit.ends_at);
    return {
      category: pro.category_key, canPrescribe, prescriberNote: PRESCRIBERS.includes(pro.category_key) && !canPrescribe ? "Add your registration number to your profile to write prescriptions and order tests." : "",
      professional: { name: pro.name, role: pro.role, qualification: pro.qualification, registration: pro.registration_no },
      visit: {
        id: visit.id, bookingId: visit.booking_id, status: visit.status, mode: visit.mode, service: visit.service_name, bookingNotes: visit.booking_notes,
        when: formatIst(starts, { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }),
        patient: { name: visit.patient_name, age: visit.age ?? "", gender: visit.gender ?? "" },
      },
      // A new report starts with the visit's date, time and booked length filled in.
      defaults: { date: starts.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }), time: starts.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }), duration: String(minutes(starts, ends)) },
      report: visit.report_id ? {
        status: visit.report_status, data: visit.data, summary: visit.summary, summarySource: visit.summary_source, attachments: visit.attachments,
        consent: visit.consent, signedName: visit.signed_name, signedRegistration: visit.signed_registration, signedAt: visit.signed_at, updatedAt: visit.updated_at,
      } : null,
    };
  });

  // Save a draft. Only the template's fields are kept.
  app.put<{ Params: { id: string } }>("/pro/visits/:id/report", async (request) => {
    const user = await requireUser(request);
    const { pro, visit, tpl } = await visitFor(user, request.params.id);
    if (visit.report_status === "submitted") throw new ApiError(409, "This report is already submitted.");
    const body = draftBody.parse(request.body);
    const data = cleanReport(tpl, body.data as ReportData);
    const files = ownAttachments(visit.id, body.attachments);
    const { rows } = await pool.query(
      `insert into consultation_reports (visit_id, booking_id, professional_id, owner_id, patient_id, category_key, data, summary, summary_source, attachments)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       on conflict (visit_id) do update set data = excluded.data, summary = excluded.summary, summary_source = excluded.summary_source, attachments = excluded.attachments, updated_at = now()
       where consultation_reports.status = 'draft'
       returning updated_at`,
      [visit.id, visit.booking_id, pro.id, visit.owner_id, visit.patient_id, pro.category_key, data, body.summary, body.summarySource, JSON.stringify(files)],
    );
    if (!visit.report_id) await audit(user.id, "report.draft", visit.id);
    return { savedAt: rows[0]?.updated_at };
  });

  // Turn the entered details into a written report. AI only rephrases; it never adds findings.
  app.post<{ Params: { id: string } }>("/pro/visits/:id/report/write", { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } }, async (request) => {
    const user = await requireUser(request);
    const { pro, tpl } = await visitFor(user, request.params.id);
    const { data } = z.object({ data: z.record(z.string(), z.unknown()).default({}) }).parse(request.body);
    return writeReport(tpl, cleanReport(tpl, data as ReportData), pro.role, request.log);
  });

  // A one-time upload link for a report file: lab reports, images, scans.
  app.post<{ Params: { id: string } }>("/pro/visits/:id/report/files/sign", async (request) => {
    const user = await requireUser(request);
    const { visit } = await visitFor(user, request.params.id);
    const body = z.object({ fileName: z.string().min(1).max(200), size: z.number().int().positive().max(MAX_BYTES, "Files must be 20 MB or smaller."), type: z.string() }).parse(request.body);
    if (!FILE_TYPES.includes(body.type)) throw new ApiError(400, "Please attach a PDF or a photo (JPG, PNG, WebP or HEIC).");
    const path = `reports/${visit.id}/${randomUUID()}-${safeFileName(body.fileName)}`;
    return { uploadUrl: await signedUpload(path, BUCKET), path };
  });

  app.post<{ Params: { id: string } }>("/pro/visits/:id/report/files/url", async (request) => {
    const user = await requireUser(request);
    const { visit } = await visitFor(user, request.params.id);
    const { path } = z.object({ path: z.string() }).parse(request.body);
    if (!path.startsWith(`reports/${visit.id}/`)) throw new ApiError(404, "File not found.");
    return { url: await signedDownload(path) };
  });

  // Sign and submit. The report is checked, locked, added to the patient's history, and the visit is completed.
  app.post<{ Params: { id: string } }>("/pro/visits/:id/report/submit", async (request) => {
    const user = await requireUser(request);
    const { pro, visit, tpl } = await visitFor(user, request.params.id);
    if (visit.report_status === "submitted") throw new ApiError(409, "This report is already submitted.");
    if (!["in_session", "completed"].includes(visit.status)) throw new ApiError(409, "Start the session before submitting its report.");
    const body = draftBody.extend({
      consent: z.literal(true, { message: "Please confirm the patient consented to this consultation and report." }),
      declaration: z.literal(true, { message: "Please confirm the report is accurate." }),
      signature: z.string().trim().min(2, "Please sign with your full name."),
    }).parse(request.body);
    const data = cleanReport(tpl, body.data as ReportData);
    const missing = missingFields(tpl, data);
    if (missing.length) throw new ApiError(400, `Please fill in: ${missing.join(", ")}.`);
    if (!sameName(body.signature, pro.name)) throw new ApiError(400, `Please sign with your name as it appears on your profile: ${pro.name}.`);
    const files = ownAttachments(visit.id, body.attachments);
    const summary = body.summary.trim() || plainReport(tpl, data);

    await pool.query(
      `insert into consultation_reports (visit_id, booking_id, professional_id, owner_id, patient_id, category_key, data, summary, summary_source, attachments,
         status, consent, signed_name, signed_registration, signed_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'submitted',true,$11,$12,now())
       on conflict (visit_id) do update set data = excluded.data, summary = excluded.summary, summary_source = excluded.summary_source, attachments = excluded.attachments,
         status = 'submitted', consent = true, signed_name = excluded.signed_name, signed_registration = excluded.signed_registration, signed_at = now(), updated_at = now()
       where consultation_reports.status = 'draft'`,
      [visit.id, visit.booking_id, pro.id, visit.owner_id, visit.patient_id, pro.category_key, data, summary, body.summarySource || "template", JSON.stringify(files), pro.name, pro.registration_no ?? ""],
    );
    if (visit.status !== "completed") await completeVisit(visit, pro.name, user.id, headline(data));
    await audit(user.id, "report.submit", visit.id);
    return { ok: true };
  });

  // The patient's Consultation History: every submitted report for their family, newest first.
  app.get("/consultations", async (request) => {
    const user = await requireUser(request);
    const { rows } = await pool.query(
      `select r.id, r.category_key, r.data, r.signed_at, b.patient_name, b.service_name, b.mode, p.name professional, p.photo_url, c.one role
       from consultation_reports r join bookings b on b.id = r.booking_id join professionals p on p.id = r.professional_id join categories c on c.key = r.category_key
       where r.owner_id = $1 and r.status = 'submitted' order by r.signed_at desc`,
      [user.id],
    );
    return rows.map((r) => ({
      id: r.id, date: r.signed_at, patient: r.patient_name, service: r.service_name, online: r.mode === "online",
      professional: r.professional, photo: r.photo_url, role: r.role, title: reportTemplate(r.category_key).title, headline: headline(r.data),
      hasPrescription: Array.isArray(r.data.medicines) && r.data.medicines.length > 0, next: r.data.next ?? "",
    }));
  });

  app.get<{ Params: { id: string } }>("/consultations/:id", async (request) => {
    const user = await requireUser(request);
    const { rows } = await pool.query(
      `select r.*, v.starts_at, b.patient_name, b.service_name, b.mode, pa.age, pa.gender, p.name professional, p.qualification, c.one role
       from consultation_reports r join visits v on v.id = r.visit_id join bookings b on b.id = r.booking_id left join patients pa on pa.id = r.patient_id
         join professionals p on p.id = r.professional_id join categories c on c.key = r.category_key
       where r.id = $1 and r.owner_id = $2 and r.status = 'submitted'`,
      [request.params.id, user.id],
    );
    const r = rows[0];
    if (!r) throw new ApiError(404, "Report not found.");
    await audit(user.id, "report.read", r.id);
    return {
      id: r.id, category: r.category_key, data: forPatient(r.category_key, r.data), summary: r.summary,
      files: (r.attachments as { name: string; size: number; type: string }[]).map((a, i) => ({ i, name: a.name, size: a.size, type: a.type })),
      patient: { name: r.patient_name, age: r.age ?? "", gender: r.gender ?? "" }, service: r.service_name, online: r.mode === "online", bookingId: r.booking_id,
      visitDate: formatIst(new Date(r.starts_at), { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }),
      professional: { name: r.professional, role: r.role, qualification: r.qualification },
      signed: { name: r.signed_name, registration: r.signed_registration, at: formatIst(new Date(r.signed_at), { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) },
    };
  });

  app.get<{ Params: { id: string; i: string } }>("/consultations/:id/files/:i", async (request) => {
    const user = await requireUser(request);
    const { rows } = await pool.query("select attachments from consultation_reports where id = $1 and owner_id = $2 and status = 'submitted'", [request.params.id, user.id]);
    const file = (rows[0]?.attachments as { path: string }[] | undefined)?.[Number(request.params.i)];
    if (!file) throw new ApiError(404, "File not found.");
    await audit(user.id, "report.file.read", `${request.params.id}/${request.params.i}`);
    return { url: await signedDownload(file.path) };
  });
}

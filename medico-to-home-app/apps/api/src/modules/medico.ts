import Anthropic from "@anthropic-ai/sdk";
import { bioFacts, COUNCILS, displayName, KERALA_DISTRICTS, MEDICO_CATEGORY, MEDICO_GENDERS, MEDICO_LANGUAGES, MEDICO_SLOTS, normaliseMedico, RADIUS_KM, templateBio, totalYears, YEARS_MAX, type MedicoProfile } from "@medico/shared";
import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireUser, type User } from "../auth";
import { pool } from "../db";
import { env } from "../env";
import { ApiError } from "../errors";
import { adminEmails, sendMail } from "../mail/send";
import { medicoReceived, newAccountForAdmin } from "../mail/templates";
import { signedUpload } from "../storage";

// Profile photos are public: they appear on the Medico's profile page.
const PHOTO_BUCKET = "medico-photos";
const PHOTO_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const BIO_MODEL = "claude-opus-5-5";
const BIO_MAX_WORDS = 65;

const text = (max: number) => z.string().trim().max(max).default("");
const oneOf = (values: readonly string[]) => z.string().refine((v) => !v || values.includes(v), "Please choose from the list.").default("");
const year = z.string().trim().regex(/^(\d{4})?$/, "Years have 4 digits.").default("");

// Every field is optional: a Medico can skip any step and finish later.
const profileBody = z.object({
  name: text(120),
  role: oneOf(Object.keys(MEDICO_CATEGORY)), // includes old role names, which normaliseMedico renames
  specialisation: text(120),
  qualification: text(160),
  gender: oneOf(MEDICO_GENDERS),
  photoUrl: z.string().trim().max(500).refine((v) => !v || v.startsWith(`${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/`), "Please upload the photo again.").default(""),
  council: oneOf(COUNCILS),
  registrationNo: z.string().trim().max(60).transform((v) => v.toUpperCase()).default(""),
  phone: z.string().trim().transform((v) => v.replace(/\D/g, "").slice(-10)).refine((v) => !v || v.length === 10, "Please enter a 10-digit mobile number.").default(""),
  email: z.string().trim().max(200).refine((v) => !v || z.string().email().safeParse(v).success, "Please enter a valid email address.").default(""),
  district: oneOf(KERALA_DISTRICTS),
  experienceMode: z.enum(["years", "workplaces"]).default("years"),
  years: z.coerce.number().int().min(0).max(YEARS_MAX).default(0),
  workplaces: z.array(z.object({ place: text(160), role: text(120), from: year, to: z.string().trim().regex(/^(\d{4}|Present)?$/).default("") })).max(15).default([]),
  awards: z.array(z.object({ title: text(160), by: text(160), year })).max(20).default([]),
  slots: z.array(z.enum(MEDICO_SLOTS)).max(MEDICO_SLOTS.length).default([]),
  languages: z.array(z.enum(MEDICO_LANGUAGES)).max(MEDICO_LANGUAGES.length).default([]),
  radiusKm: z.coerce.number().int().min(RADIUS_KM.min).max(RADIUS_KM.max).default(RADIUS_KM.default),
  bio: text(1200),
}).transform(normaliseMedico);

const anthropic = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;

const BIO_SYSTEM = `You write the public profile bio of a healthcare professional ("Medico") on Medico To Home, a home-healthcare service in Kerala, India. Patients' families read it before booking a home visit.

Write 2 or 3 sentences, at most ${BIO_MAX_WORDS} words, in the third person, warm and professional.
Use only the facts in the JSON the user sends. Leave out anything that is empty. Do not invent qualifications, places, numbers, awards or personal traits.
Never include a phone number, email address, street address or any other way to contact the person.
Reply with the bio text only: no heading, quotes or notes.`;

// A bio that slipped in contact details or ran long is replaced by the template.
const looksSafe = (bio: string) => bio && !/@|\d{6,}|https?:\/\//.test(bio) && bio.split(/\s+/).length <= BIO_MAX_WORDS + 5;

async function writeBio(profile: MedicoProfile, log: { warn: (o: unknown, m: string) => void }): Promise<{ bio: string; source: "ai" | "template" }> {
  const template = { bio: templateBio(profile), source: "template" as const };
  if (!anthropic) return template;
  try {
    const response = await anthropic.beta.messages.create({
      model: BIO_MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: BIO_SYSTEM,
      messages: [{ role: "user", content: JSON.stringify(bioFacts(profile)) }],
    });
    if (response.stop_reason === "refusal") return template;
    const bio = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join(" ").trim().replace(/^["“]|["”]$/g, "");
    return looksSafe(bio) ? { bio, source: "ai" } : template;
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError || error instanceof Anthropic.APIConnectionError) log.warn({ error: error.message }, "AI bio unavailable, used the template");
    else if (error instanceof Anthropic.APIError) log.warn({ status: error.status, error: error.message }, "AI bio failed, used the template");
    else throw error;
    return template;
  }
}

async function latest(user: User) {
  const { rows } = await pool.query(
    "select id, stage, decision_note, details, submitted_at from applications where profile_id = $1 order by created_at desc limit 1",
    [user.id],
  );
  return rows[0] as { id: number; stage: string; decision_note: string; details: { kind?: string; profile?: MedicoProfile }; submitted_at: string | null } | undefined;
}

export async function medicoRoutes(app: FastifyInstance) {
  // The registration and its review state, if this account has started one.
  app.get("/medico/profile", async (request) => {
    const user = await requireUser(request);
    const [app_, me] = await Promise.all([latest(user), pool.query("select full_name, phone, email from profiles where id = $1", [user.id])]);
    return {
      account: me.rows[0],
      application: app_ ? { stage: app_.stage, decisionNote: app_.decision_note, submittedAt: app_.submitted_at, profile: app_.details?.kind === "medico" ? app_.details.profile : null } : null,
    };
  });

  app.post("/medico/photo/sign", async (request) => {
    const user = await requireUser(request);
    const body = z.object({ contentType: z.string(), size: z.number().int().positive().max(MAX_PHOTO_BYTES, "Photos must be 5 MB or smaller.") }).parse(request.body);
    const ext = PHOTO_TYPES[body.contentType];
    if (!ext) throw new ApiError(400, "Please choose a JPG, PNG or WebP photo.");
    const path = `${user.id}/${randomUUID()}.${ext}`;
    return { uploadUrl: await signedUpload(path, PHOTO_BUCKET), publicUrl: `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${path}` };
  });

  app.post("/medico/bio", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (request) => {
    await requireUser(request);
    const profile: MedicoProfile = profileBody.parse(request.body);
    return writeBio(profile, request.log);
  });

  // Sends the registration (or updates it while it is still in review). Signing in agreed to the terms.
  app.put("/medico/profile", async (request) => {
    const user = await requireUser(request);
    const p: MedicoProfile = profileBody.parse(request.body);
    const current = await latest(user);
    if (current?.stage === "approved") throw new ApiError(409, "Your profile is already approved. Change it from professional mode.");

    const details = { kind: "medico", profile: { ...p, years: totalYears(p) } };
    const firstSend = !current?.submitted_at || current.stage === "rejected";
    const values = [p.name, p.phone, p.gender, p.email || user.email, p.role, p.district, p.registrationNo, details];
    if (current && current.stage !== "rejected") {
      await pool.query(
        `update applications set name = $2, phone = $3, gender = $4, email = $5, profession = $6, district = $7, registration_no = $8, details = $9,
           stage = case when stage = 'info_needed' then 'documents' else stage end, decision_note = case when stage = 'info_needed' then '' else decision_note end,
           submitted_at = now(), updated_at = now()
         where id = $1`,
        [current.id, ...values],
      );
    } else {
      await pool.query(
        `insert into applications (name, phone, gender, email, profession, district, registration_no, details, profile_id, submitted_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())`,
        [...values, user.id],
      );
    }
    // The account picks up the name and city; the mobile only if no other account uses it.
    await pool.query(
      `update profiles set full_name = coalesce(nullif($2, ''), full_name), city = coalesce(nullif($3, ''), city), terms_accepted_at = coalesce(terms_accepted_at, now()),
         phone = case when $4 <> '' and not exists (select 1 from profiles o where o.phone = $4 and o.id <> $1) then $4 else phone end
       where id = $1`,
      [user.id, p.name, p.district, p.phone],
    );
    if (firstSend) {
      const name = displayName(p) || p.name;
      sendMail(p.email || user.email, medicoReceived(name));
      sendMail(adminEmails(), newAccountForAdmin({ kind: "medico", id: user.id, name, email: p.email || user.email, phone: p.phone, place: p.district, role: [p.role, p.specialisation].filter(Boolean).join(" · ") }));
    }
    return { ok: true };
  });
}

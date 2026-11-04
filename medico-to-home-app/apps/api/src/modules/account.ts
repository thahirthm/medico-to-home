import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { audit, canOpen, MODULES, requireUser, type Module, type User } from "../auth";
import { pool } from "../db";
import { env } from "../env";
import { ApiError } from "../errors";
import { adminEmails, sendMail } from "../mail/send";
import { newAccountForAdmin, welcomePatient } from "../mail/templates";

import { BUCKET, MAX_BYTES, safeFileName, signedDownload, signedUpload } from "../storage";

async function ownedPatient(user: User, id: string) {
  const { rows } = await pool.query("select * from patients where id = $1 and owner_id = $2", [id, user.id]);
  if (!rows[0]) throw new ApiError(404, "Family member not found.");
  return rows[0];
}

const toPatient = async (p: Record<string, unknown>) => {
  const docs = await pool.query("select id, file_name, size_bytes, created_at from medical_documents where patient_id = $1 order by created_at desc", [p.id]);
  return {
    id: p.id, rel: p.relation, name: p.name, age: p.age, gender: p.gender, blood: p.blood_group, h: p.height_cm, w: p.weight_kg,
    conds: p.conditions, alg: p.allergies, meds: p.medications, hist: p.history, share: p.share_records,
    reps: docs.rows.map((d) => ({ id: d.id, n: d.file_name, size: d.size_bytes, date: d.created_at })),
  };
};

export async function ensureSelf(user: User, name: string) {
  const found = await pool.query("select * from patients where owner_id = $1 and relation = 'Me'", [user.id]);
  if (found.rows[0]) return found.rows[0];
  const { rows } = await pool.query("insert into patients (owner_id, relation, name) values ($1, 'Me', $2) returning *", [user.id, name]);
  return rows[0];
}

const patientBody = z.object({
  rel: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
  blood: z.string().optional(),
  h: z.string().optional(),
  w: z.string().optional(),
  conds: z.array(z.object({ n: z.string(), since: z.string() })).optional(),
  alg: z.array(z.string()).optional(),
  meds: z.array(z.object({ n: z.string(), dose: z.string(), freq: z.string() })).optional(),
  hist: z.array(z.object({ date: z.string(), title: z.string(), by: z.string(), note: z.string() })).optional(),
  share: z.boolean().optional(),
});

export async function accountRoutes(app: FastifyInstance) {
  // Everything the portal needs to route a signed-in account: new-account step, role switcher, staff modules.
  app.get("/me", async (request) => {
    const user = await requireUser(request);
    const [me, pro, application] = await Promise.all([
      pool.query("select id, full_name, phone, email, dob, emergency_contact, city, preferred_language, role, staff_roles, last_mode, terms_accepted_at from profiles where id = $1", [user.id]),
      pool.query("select id, name, status from professionals where profile_id = $1", [user.id]),
      pool.query("select stage, decision_note, profession, submitted_at from applications where profile_id = $1 order by created_at desc limit 1", [user.id]),
    ]);
    const p = me.rows[0];
    const staff = p.role === "admin";
    return {
      ...p,
      needs_setup: !p.terms_accepted_at,
      professional: pro.rows[0] ?? null,
      application: application.rows[0] ?? null,
      staff,
      two_step: user.aal === "aal2",
      modules: staff ? (Object.keys(MODULES) as Module[]).filter((m) => canOpen(p.staff_roles, m)) : [],
    };
  });

  // New account registration, asked once after the first sign-in. Name, mobile, city and the terms are
  // required; personal, address, emergency and health details are optional and fill the "Me" record.
  app.post("/me/setup", async (request) => {
    const user = await requireUser(request);
    const text = z.string().trim().max(200).default("");
    const list = z.array(z.string().trim().min(1).max(120)).max(40).default([]);
    const body = z
      .object({
        full_name: z.string().trim().min(2, "Please enter your full name."),
        phone: z.string().trim().regex(/^\d{10}$/, "Please enter a 10-digit mobile number."),
        city: z.string().trim().min(2, "Please choose your city."),
        accept_terms: z.literal(true, { message: "Please accept the terms and privacy policy." }),
        gender: text,
        dob: z.string().trim().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Please enter a valid date of birth.").default(""),
        language: text,
        emergency_contact: text,
        address: z.object({ house: text, street: text, landmark: text, locality: text, pincode: z.string().trim().regex(/^(\d{6})?$/, "Please enter a 6-digit pincode.").default("") }).optional(),
        health: z.object({ blood: text, h: text, w: text, conds: list, alg: list, meds: list }).optional(),
      })
      .parse(request.body);
    const before = (await pool.query("select email, terms_accepted_at from profiles where id = $1", [user.id])).rows[0];
    await pool.query(
      `update profiles set full_name = $2, phone = $3, city = $4, dob = $5, emergency_contact = $6, preferred_language = $7,
       terms_accepted_at = coalesce(terms_accepted_at, now()) where id = $1`,
      [user.id, body.full_name, body.phone, body.city, body.dob, body.emergency_contact, body.language],
    );

    const self = await ensureSelf(user, body.full_name);
    const born = body.dob ? new Date(body.dob) : null;
    const age = born && !isNaN(+born) ? String(Math.floor((Date.now() - +born) / 31_557_600_000)) : self.age;
    // Keep what the records page already knows (since when, dose) for anything ticked again.
    const conds = (body.health?.conds ?? []).map((n) => self.conditions.find((c: { n: string }) => c.n === n) ?? { n, since: "" });
    const meds = (body.health?.meds ?? []).map((n) => self.medications.find((m: { n: string }) => m.n === n) ?? { n, dose: "", freq: "" });
    await pool.query(
      `update patients set name = $2, age = $3, gender = $4, blood_group = $5, height_cm = $6, weight_kg = $7,
       conditions = $8, allergies = $9, medications = $10 where id = $1`,
      [self.id, body.full_name, age, body.gender, body.health?.blood ?? "", body.health?.h ?? "", body.health?.w ?? "", JSON.stringify(conds), JSON.stringify(body.health?.alg ?? []), JSON.stringify(meds)],
    );

    const a = body.address;
    if (a && Object.values(a).some(Boolean)) {
      const home = await pool.query("select id from addresses where owner_id = $1 and label = 'Home' order by created_at limit 1", [user.id]);
      if (home.rows[0]) await pool.query("update addresses set house = $2, street = $3, landmark = $4, locality = $5, pincode = $6 where id = $1", [home.rows[0].id, a.house, a.street, a.landmark, a.locality, a.pincode]);
      else await pool.query("insert into addresses (owner_id, label, house, street, landmark, locality, pincode) values ($1, 'Home', $2, $3, $4, $5, $6)", [user.id, a.house, a.street, a.landmark, a.locality, a.pincode]);
    }
    if (!before?.terms_accepted_at) {
      const email = before?.email || user.email;
      sendMail(email, welcomePatient(body.full_name));
      sendMail(adminEmails(), newAccountForAdmin({ kind: "patient", id: user.id, name: body.full_name, email, phone: body.phone, place: body.city }));
    }
    return { ok: true };
  });

  // The role switcher remembers the last mode so the next sign-in opens there.
  app.put("/me/mode", async (request) => {
    const user = await requireUser(request);
    const { mode } = z.object({ mode: z.enum(["patient", "professional"]) }).parse(request.body);
    // Professional mode opens once a Medico registration is sent; while it is checked, the dashboard shows its progress.
    if (mode === "professional") {
      const pro = await pool.query(
        `select 1 from professionals where profile_id = $1
         union all select 1 from applications where profile_id = $1 and submitted_at is not null and stage <> 'rejected'`,
        [user.id],
      );
      if (!pro.rowCount) throw new ApiError(403, "Professional mode opens after you send your Medico registration.");
    }
    await pool.query("update profiles set last_mode = $2 where id = $1", [user.id, mode]);
    return { mode };
  });

  app.patch("/me", async (request) => {
    const user = await requireUser(request);
    const body = z.object({ full_name: z.string().trim().min(1, "Please enter your name."), phone: z.string().trim().regex(/^(\d{10})?$/, "Please enter a 10-digit mobile number."), dob: z.string().trim(), emergency_contact: z.string().trim(), city: z.string().trim() }).partial().parse(request.body);
    await pool.query(
      `update profiles set full_name = coalesce($2, full_name), phone = coalesce(nullif($3, ''), phone), dob = coalesce($4, dob),
       emergency_contact = coalesce($5, emergency_contact), city = coalesce(nullif($6, ''), city) where id = $1`,
      [user.id, body.full_name, body.phone, body.dob, body.emergency_contact, body.city],
    );
    if (body.full_name) await pool.query("update patients set name = $2 where owner_id = $1 and relation = 'Me'", [user.id, body.full_name]);
    return { ok: true };
  });

  app.get("/patients", async (request) => {
    const user = await requireUser(request);
    const me = await pool.query("select full_name from profiles where id = $1", [user.id]);
    await ensureSelf(user, me.rows[0]?.full_name ?? "");
    const { rows } = await pool.query("select * from patients where owner_id = $1 order by relation = 'Me' desc, created_at", [user.id]);
    await audit(user.id, "records.read", "own family");
    return Promise.all(rows.map(toPatient));
  });

  app.post("/patients", async (request, reply) => {
    const user = await requireUser(request);
    const body = z.object({ name: z.string().trim().min(1, "Please enter a name."), rel: z.string().trim().default("Family"), age: z.string().default(""), gender: z.string().default("") }).parse(request.body);
    const { rows } = await pool.query("insert into patients (owner_id, relation, name, age, gender) values ($1,$2,$3,$4,$5) returning *", [user.id, body.rel, body.name, body.age, body.gender]);
    return reply.code(201).send(await toPatient(rows[0]));
  });

  app.put<{ Params: { id: string } }>("/patients/:id", async (request) => {
    const user = await requireUser(request);
    await ownedPatient(user, request.params.id);
    const b = patientBody.parse(request.body);
    const json = (v: unknown) => (v === undefined ? null : JSON.stringify(v));
    await pool.query(
      `update patients set relation = coalesce($2, relation), name = coalesce($3, name), age = coalesce($4, age), gender = coalesce($5, gender),
        blood_group = coalesce($6, blood_group), height_cm = coalesce($7, height_cm), weight_kg = coalesce($8, weight_kg),
        conditions = coalesce($9, conditions), allergies = coalesce($10, allergies), medications = coalesce($11, medications),
        history = coalesce($12, history), share_records = coalesce($13, share_records) where id = $1`,
      [request.params.id, b.rel, b.name, b.age, b.gender, b.blood, b.h, b.w, json(b.conds), json(b.alg), json(b.meds), json(b.hist), b.share],
    );
    return { ok: true };
  });

  app.delete<{ Params: { id: string } }>("/patients/:id", async (request) => {
    const user = await requireUser(request);
    const patient = await ownedPatient(user, request.params.id);
    if (patient.relation === "Me") throw new ApiError(400, "Your own profile cannot be removed.");
    // Their records go with them (the rows cascade); the uploaded files are removed from storage as well.
    const docs = await pool.query("select storage_path from medical_documents where patient_id = $1", [patient.id]);
    await pool.query("delete from patients where id = $1", [patient.id]);
    await Promise.all(docs.rows.map((d) => fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${BUCKET}/${d.storage_path}`, { method: "DELETE", headers: { apikey: env.SUPABASE_SECRET_KEY } }).catch(() => {})));
    await audit(user.id, "patient.delete", patient.id);
    return { ok: true };
  });

  app.post<{ Params: { id: string } }>("/patients/:id/documents/sign", async (request) => {
    const user = await requireUser(request);
    await ownedPatient(user, request.params.id);
    const body = z.object({ fileName: z.string().min(1).max(200), size: z.number().int().positive().max(MAX_BYTES, "Files must be 20 MB or smaller.") }).parse(request.body);
    const path = `${user.id}/${request.params.id}/${randomUUID()}-${safeFileName(body.fileName)}`;
    return { uploadUrl: await signedUpload(path), path };
  });

  app.post<{ Params: { id: string } }>("/patients/:id/documents", async (request, reply) => {
    const user = await requireUser(request);
    const patient = await ownedPatient(user, request.params.id);
    const body = z.object({ fileName: z.string().min(1).max(200), path: z.string(), size: z.number().int() }).parse(request.body);
    if (!body.path.startsWith(`${user.id}/${patient.id}/`)) throw new ApiError(400, "Invalid file.");
    const { rows } = await pool.query(
      "insert into medical_documents (patient_id, owner_id, file_name, storage_path, size_bytes) values ($1,$2,$3,$4,$5) returning id, file_name, size_bytes, created_at",
      [patient.id, user.id, body.fileName, body.path, body.size],
    );
    const d = rows[0];
    return reply.code(201).send({ id: d.id, n: d.file_name, size: d.size_bytes, date: d.created_at });
  });

  app.get<{ Params: { id: string } }>("/documents/:id/url", async (request) => {
    const user = await requireUser(request);
    const { rows } = await pool.query("select storage_path, file_name from medical_documents where id = $1 and owner_id = $2", [request.params.id, user.id]);
    if (!rows[0]) throw new ApiError(404, "File not found.");
    const url = await signedDownload(rows[0].storage_path);
    await audit(user.id, "document.read", request.params.id);
    return { url };
  });

  app.delete<{ Params: { id: string } }>("/documents/:id", async (request) => {
    const user = await requireUser(request);
    const { rows } = await pool.query("delete from medical_documents where id = $1 and owner_id = $2 returning storage_path", [request.params.id, user.id]);
    if (!rows[0]) throw new ApiError(404, "File not found.");
    await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${BUCKET}/${rows[0].storage_path}`, { method: "DELETE", headers: { apikey: env.SUPABASE_SECRET_KEY } });
    return { ok: true };
  });

  app.get("/addresses", async (request) => {
    const user = await requireUser(request);
    const { rows } = await pool.query("select id, label, house, street, landmark, locality, pincode from addresses where owner_id = $1 order by created_at", [user.id]);
    return rows;
  });

  app.delete<{ Params: { id: string } }>("/addresses/:id", async (request) => {
    const user = await requireUser(request);
    await pool.query("delete from addresses where id = $1 and owner_id = $2", [request.params.id, user.id]);
    return { ok: true };
  });
}

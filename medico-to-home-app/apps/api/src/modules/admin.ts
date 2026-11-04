import { displayName, MEDICO_CATEGORY, medicoRole, spokenLanguages, professionByLabel, totalYears, VERIFICATION_STEPS, type MedicoProfile } from "@medico/shared";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { audit, requireStaff, STAFF_ROLES, type Module } from "../auth";
import { pool } from "../db";
import { env } from "../env";
import { ApiError } from "../errors";
import { sendMail } from "../mail/send";
import { medicoApproved, medicoInfoNeeded, medicoLive, medicoRejected, medicoStepPassed } from "../mail/templates";
import { BUCKET, signedDownload } from "../storage";
import { formatIst, startOfIstDay, startOfIstWeek } from "../time";
import { weeklyEarnings } from "./earnings";
import { listingServices } from "./medico";

const STAGES = VERIFICATION_STEPS.map((s) => s.stage) as string[];
const DAY_MS = 86_400_000;
const text = (v: unknown) => (typeof v === "string" ? v : "");
const int = (v: unknown, fallback: number) => (Number.parseInt(text(v), 10) > 0 ? Number.parseInt(text(v), 10) : fallback);

const staffBody = z.object({ roles: z.array(z.enum(STAFF_ROLES)).min(1, "Choose at least one role.") });

const admin = (request: FastifyRequest, module: Module) => requireStaff(request, module);

const professionalBody = z.object({
  name: z.string().trim().min(2),
  gender: z.enum(["F", "M"]),
  category_key: z.string().min(1),
  qualification: z.string().trim().default(""),
  experience_years: z.coerce.number().int().min(0).default(0),
  locality: z.string().min(1),
  languages: z.array(z.string()).default([]),
  base_price: z.coerce.number().int().positive(),
  radius_km: z.coerce.number().int().positive().default(8),
  bio: z.string().default(""),
  photo_url: z.string().default(""),
  registration_no: z.string().trim().default(""),
  available_today_from: z.string().default(""),
  status: z.enum(["pending", "live", "hidden"]).default("pending"),
});

// The content tables admins can edit, and the columns allowed for each.
const CONTENT: Record<string, { columns: string[]; order: string; key: string }> = {
  categories: { columns: ["label", "one", "plural", "brand", "unit", "registration_label", "sort_order"], order: "sort_order", key: "key" },
  service_templates: { columns: ["category_key", "name", "multiplier", "duration", "sort_order"], order: "category_key, sort_order, id", key: "id" },
  therapies: { columns: ["id", "label", "category_key", "brand", "helps", "steps", "plan", "sort_order"], order: "sort_order", key: "id" },
  faqs: { columns: ["question", "answer", "sort_order"], order: "sort_order, id", key: "id" },
};

function contentTable(name: string) {
  const table = CONTENT[name];
  if (!table) throw new ApiError(404, "Unknown content type.");
  return table;
}

const pick = (body: unknown, columns: string[]) => Object.entries(z.record(z.string(), z.unknown()).parse(body)).filter(([k]) => columns.includes(k));

// A Medico registration becomes a professional profile on the same account, hidden ('pending') until staff set it live.
async function approveMedico(application: { id: number; profile_id: string | null; details: { profile: MedicoProfile } }) {
  const p = application.details.profile;
  const category = MEDICO_CATEGORY[medicoRole(p.role)];
  if (!category) throw new ApiError(400, "The applicant has not chosen a role yet. Ask them for it first.");
  // Their own town's service area when there is one, else the first in their district.
  const locality = (await pool.query("select id from localities where district = $1 order by (name = $2) desc, id limit 1", [p.district, p.town ?? ""])).rows[0];
  if (!locality) throw new ApiError(400, `Add a service area in ${p.district || "their district"} under Content first, or ask the applicant for their district.`);
  // Their own services set the listing's prices; the lowest is the "from" price on their card.
  const { services, basePrice } = listingServices(p);
  await pool.query(
    `insert into professionals (name, gender, category_key, qualification, experience_years, locality_id, languages, base_price, radius_km, bio, photo_url, registration_no,
       weekly, all_day, service_towns, services, status, profile_id)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'pending',$17)`,
    [
      displayName(p), p.gender === "Male" ? "M" : "F", category, [p.qualification, p.specialisation].filter(Boolean).join(", "), totalYears(p), locality.id,
      spokenLanguages(p), basePrice, p.radiusKm, p.bio, p.photoUrl, p.registrationNo,
      JSON.stringify(p.weekly ?? {}), !!p.allDay, p.serviceTowns ?? [], JSON.stringify(services), application.profile_id,
    ],
  );
  await pool.query("update applications set stage = 'approved', decision_note = '' where id = $1", [application.id]);
  return { stage: "approved" };
}

// Where to email an applicant: the address on their registration, else their account's.
async function applicantEmail(application: { email?: string; profile_id: string | null }) {
  if (application.email) return application.email;
  if (!application.profile_id) return "";
  return (await pool.query("select email from profiles where id = $1", [application.profile_id])).rows[0]?.email ?? "";
}

export async function adminRoutes(app: FastifyInstance) {
  app.get("/admin/overview", async (request) => {
    await admin(request, "overview");
    const from = new Date(startOfIstDay().getTime() - 6 * DAY_MS);
    const [counts, perDay, latest, apps] = await Promise.all([
      pool.query(`select (select count(*) from bookings where status = 'active')::int active, (select count(*) from applications where stage not in ('approved', 'rejected'))::int applications,
        (select count(*) from professionals where status = 'live')::int live`),
      pool.query("select created_at from bookings where created_at >= $1", [from]),
      pool.query(`select b.id, b.service_name, b.patient_name, b.status, p.name professional, b.created_at from bookings b join professionals p on p.id = b.professional_id order by b.created_at desc limit 5`),
      pool.query(`select id, name, profession, district, created_at from applications where stage not in ('approved', 'rejected') order by created_at desc limit 4`),
    ]);
    const days = Array.from({ length: 7 }, (_, i) => {
      const start = from.getTime() + i * DAY_MS;
      return {
        day: formatIst(new Date(start), { weekday: "short" }),
        count: perDay.rows.filter((r) => { const t = new Date(r.created_at).getTime(); return t >= start && t < start + DAY_MS; }).length,
      };
    });
    const week = await weeklyEarnings(startOfIstWeek());
    return { ...counts.rows[0], days, latest: latest.rows, recentApplications: apps.rows, payoutDue: week.filter((w) => !w.paid).reduce((s, w) => s + w.net, 0) };
  });

  // Account details only. Medical records stay out of this list.
  app.get("/admin/users", async (request) => {
    await admin(request, "users");
    const { rows } = await pool.query(
      `select p.id, p.email, p.full_name, p.phone, p.created_at, u.last_sign_in_at,
         case when p.role = 'admin' then 'admin' when exists (select 1 from professionals x where x.profile_id = p.id) then 'professional' else 'patient' end role,
         (select count(*) from patients x where x.owner_id = p.id)::int family,
         (select count(*) from bookings b where b.owner_id = p.id)::int bookings
       from profiles p join auth.users u on u.id = p.id order by p.created_at desc`,
    );
    return rows;
  });

  // One account in full. Family members show their basic details and how much health data they hold, never the records themselves.
  app.get<{ Params: { id: string } }>("/admin/users/:id", async (request) => {
    const me = await admin(request, "users");
    const id = z.string().uuid("User not found.").parse(request.params.id);
    const account = (
      await pool.query(
        `select p.id, p.full_name, p.email, p.phone, p.dob, p.emergency_contact, p.city, p.role, p.staff_roles, p.last_mode, p.terms_accepted_at, p.created_at,
           u.last_sign_in_at, coalesce((select array_agg(distinct i.provider) from auth.identities i where i.user_id = p.id), '{}') sign_in_with
         from profiles p join auth.users u on u.id = p.id where p.id = $1`,
        [id],
      )
    ).rows[0];
    if (!account) throw new ApiError(404, "User not found.");
    const [family, addresses, bookings, pro, application] = await Promise.all([
      pool.query(
        `select pa.id, pa.relation, pa.name, pa.age, pa.gender, pa.blood_group, pa.share_records, pa.created_at,
           jsonb_array_length(pa.conditions) + jsonb_array_length(pa.allergies) + jsonb_array_length(pa.medications) health_entries,
           (select count(*) from medical_documents d where d.patient_id = pa.id)::int reports
         from patients pa where pa.owner_id = $1 order by pa.relation <> 'Me', pa.created_at`,
        [id],
      ),
      pool.query("select id, label, house, street, landmark, locality, pincode from addresses where owner_id = $1 order by created_at", [id]),
      pool.query(
        `select b.id, b.service_name, b.patient_name, b.status, b.total_paise, b.payment_status, b.sessions, b.created_at, p.name professional,
           (select min(v.starts_at) from visits v where v.booking_id = b.id and v.status not in ('cancelled', 'skipped')) next_at
         from bookings b join professionals p on p.id = b.professional_id where b.owner_id = $1 order by b.created_at desc limit 50`,
        [id],
      ),
      pool.query("select p.id, p.name, p.status, p.rating, p.review_count, c.one role from professionals p join categories c on c.key = p.category_key where p.profile_id = $1", [id]),
      pool.query("select id, profession, stage, decision_note, created_at from applications where profile_id = $1 order by created_at desc limit 1", [id]),
    ]);
    await audit(me.id, "user.read", id);
    return { account, family: family.rows, addresses: addresses.rows, bookings: bookings.rows, professional: pro.rows[0] ?? null, application: application.rows[0] ?? null };
  });

  // Deletes the login and everything personal: profile, family health cards, addresses, records, reports and any
  // Medico application. Past bookings stay for the professional's earnings, without the account, address or notes.
  app.delete<{ Params: { id: string } }>("/admin/users/:id", async (request) => {
    const me = await admin(request, "users");
    const id = z.string().uuid("User not found.").parse(request.params.id);
    if (id === me.id) throw new ApiError(400, "You cannot delete your own account.");
    const account = (await pool.query("select email, role from profiles where id = $1", [id])).rows[0];
    if (!account) throw new ApiError(404, "User not found.");
    if (account.role === "admin") throw new ApiError(400, "This is a staff account. Remove their staff access under Staff first.");
    const open = await pool.query("select count(*)::int n from bookings where owner_id = $1 and status in ('confirmed', 'active', 'pending_payment')", [id]);
    if (open.rows[0].n) throw new ApiError(409, `This user has ${open.rows[0].n} open booking${open.rows[0].n > 1 ? "s" : ""}. Cancel or complete them before deleting the account.`);

    const client = await pool.connect();
    let files: { bucket: string; paths: string[] }[] = [];
    try {
      await client.query("begin");
      const [docs, apps] = await Promise.all([
        client.query("select storage_path from medical_documents where owner_id = $1", [id]),
        client.query("select documents, details->'profile'->>'photoUrl' photo from applications where profile_id = $1", [id]),
      ]);
      const photoPrefix = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/medico-photos/`;
      files = [
        { bucket: BUCKET, paths: [...docs.rows.map((d) => d.storage_path), ...apps.rows.flatMap((a) => (a.documents ?? []).map((d: { path: string }) => d.path))] },
        { bucket: "medico-photos", paths: apps.rows.map((a) => a.photo).filter((u) => u?.startsWith(photoPrefix)).map((u) => u.slice(photoPrefix.length)) },
      ];
      await client.query("update bookings set owner_id = null, address = jsonb_build_object('locality', address->>'locality'), notes = '' where owner_id = $1", [id]);
      await client.query("update professionals set status = 'hidden' where profile_id = $1", [id]);
      await client.query("delete from applications where profile_id = $1", [id]);
      // Removing the login cascades to the profile, family, addresses and records.
      await client.query("delete from auth.users where id = $1", [id]);
      await client.query("insert into audit_log (actor, action, subject) values ($1, 'user.delete', $2)", [me.id, `${id} ${account.email}`]);
      await client.query("commit");
    } catch (e) {
      await client.query("rollback");
      throw e;
    } finally {
      client.release();
    }
    // Files go after the rows are gone; a file left behind is harmless, a row pointing at a missing file is not.
    await Promise.all(
      files.filter((f) => f.paths.length).map((f) =>
        fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${f.bucket}`, {
          method: "DELETE",
          headers: { apikey: env.SUPABASE_SECRET_KEY, Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ prefixes: f.paths }),
        }).catch(() => {}),
      ),
    );
    return { ok: true };
  });

  app.get("/admin/applications", async (request) => {
    await admin(request, "applications");
    return (await pool.query("select * from applications order by created_at desc")).rows;
  });

  // Opens one uploaded document of an application for 5 minutes, and records who looked.
  app.get<{ Params: { id: string; kind: string } }>("/admin/applications/:id/documents/:kind", async (request) => {
    const me = await admin(request, "applications");
    const { rows } = await pool.query("select documents from applications where id = $1", [request.params.id]);
    const file = (rows[0]?.documents as { kind: string; path: string }[] | undefined)?.find((f) => f.kind === request.params.kind);
    if (!file) throw new ApiError(404, "File not found.");
    await audit(me.id, "application.document.read", `${request.params.id}/${request.params.kind}`);
    return { url: await signedDownload(file.path) };
  });

  app.post<{ Params: { id: string } }>("/admin/applications/:id/decide", async (request) => {
    const me = await admin(request, "applications");
    const { action, note, checks } = z
      .object({ action: z.enum(["pass", "ask", "reject"]), note: z.string().trim().default(""), checks: z.array(z.string()).default([]) })
      .refine((b) => b.action === "pass" || b.note, { message: "Please write what the applicant needs to know." })
      .parse(request.body);
    const application = (await pool.query("select * from applications where id = $1", [request.params.id])).rows[0];
    if (!application) throw new ApiError(404, "Application not found.");
    if (["approved", "rejected"].includes(application.stage)) throw new ApiError(409, "This application is already decided.");
    if (action === "reject" || action === "ask") {
      const stage = action === "reject" ? "rejected" : "info_needed";
      await pool.query("update applications set stage = $2, decision_note = $3 where id = $1", [application.id, stage, note]);
      sendMail(await applicantEmail(application), action === "reject" ? medicoRejected(application.name, note) : medicoInfoNeeded(application.name, note));
      return { stage };
    }
    if (application.stage === "info_needed") throw new ApiError(409, "Waiting for the applicant to send the missing details.");
    // A step passes only with every check ticked; who passed it, and when, is kept with the application.
    const step = VERIFICATION_STEPS.find((s) => s.stage === application.stage);
    if (!step) throw new ApiError(409, "This application is already decided.");
    const missing = step.checks.filter((c) => !checks.includes(c.key));
    if (missing.length) throw new ApiError(400, `Tick every check before passing ${step.label.toLowerCase()}: ${missing.map((c) => c.label.toLowerCase()).join("; ")}.`);
    const staff = (await pool.query("select coalesce(nullif(full_name, ''), email) name from profiles where id = $1", [me.id])).rows[0];
    const record = { checks: step.checks.map((c) => c.key), note, by: staff?.name ?? "Staff", at: new Date().toISOString() };
    await pool.query("update applications set checks = checks || jsonb_build_object($2::text, $3::jsonb) where id = $1", [application.id, step.stage, JSON.stringify(record)]);
    await audit(me.id, `application.${step.stage}.passed`, String(application.id));
    const next = STAGES[STAGES.indexOf(application.stage) + 1];
    const email = await applicantEmail(application);
    if (next) {
      await pool.query("update applications set stage = $2 where id = $1", [application.id, next]);
      sendMail(email, medicoStepPassed(application.name, step.label, VERIFICATION_STEPS.find((s) => s.stage === next)!.label));
      return { stage: next };
    }
    if (application.stage !== "interview") throw new ApiError(409, "This application is already decided.");
    if (application.details?.kind === "medico") {
      const approved = await approveMedico(application);
      sendMail(email, medicoApproved(application.name));
      return approved;
    }
    const d = application.details as Record<string, unknown>;
    // The area they chose, else the first area in their district.
    const locality = (await pool.query("select id from localities where name = $1 or district = $2 order by (name = $1) desc, id limit 1", [text(d.locality), application.district])).rows[0];
    const category = professionByLabel(application.profession)?.category;
    if (!locality || !category) throw new ApiError(400, "Add this district and profession first.");
    // The applicant's own account unlocks professional mode. The profile starts hidden ('pending') until staff set it live.
    await pool.query(
      `insert into professionals (name, gender, category_key, qualification, experience_years, locality_id, languages, base_price, radius_km, bio, registration_no, status, profile_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending',$12)`,
      [
        application.name, application.gender === "Male" ? "M" : "F", category,
        [text(d.qualification), text(d.specialisation)].filter(Boolean).join(", "), int(d.experience_years, 0), locality.id,
        Array.isArray(d.languages) ? d.languages : [], int(d.expected_fee, 500), int(d.radius_km, 8), text(d.bio), application.registration_no, application.profile_id,
      ],
    );
    await pool.query("update applications set stage = 'approved', decision_note = '' where id = $1", [application.id]);
    sendMail(email, medicoApproved(application.name));
    return { stage: "approved" };
  });

  app.get("/admin/professionals", async (request) => {
    await admin(request, "professionals");
    const { rows } = await pool.query(`select p.*, l.name locality, c.one role from professionals p join localities l on l.id = p.locality_id join categories c on c.key = p.category_key order by p.created_at desc, p.name`);
    return rows;
  });

  app.post("/admin/professionals", async (request, reply) => {
    await admin(request, "professionals");
    const b = professionalBody.parse(request.body);
    const { rows } = await pool.query(
      `insert into professionals (name, gender, category_key, qualification, experience_years, locality_id, languages, base_price, radius_km, bio, photo_url, registration_no, available_today_from, status)
       select $1,$2,$3,$4,$5,l.id,$6,$7,$8,$9,$10,$11,$12,$13 from localities l where l.name = $14 returning id`,
      [b.name, b.gender, b.category_key, b.qualification, b.experience_years, b.languages, b.base_price, b.radius_km, b.bio, b.photo_url, b.registration_no, b.available_today_from, b.status, b.locality],
    );
    if (!rows[0]) throw new ApiError(400, "Choose a valid locality.");
    return reply.code(201).send(rows[0]);
  });

  app.patch<{ Params: { id: string } }>("/admin/professionals/:id", async (request) => {
    await admin(request, "professionals");
    const b = professionalBody.parse(request.body);
    const { rowCount } = await pool.query(
      `update professionals p set name=$2, gender=$3, category_key=$4, qualification=$5, experience_years=$6, locality_id=l.id, languages=$7, base_price=$8, radius_km=$9,
        bio=$10, photo_url=$11, registration_no=$12, available_today_from=$13, status=$14 from localities l where p.id=$1 and l.name=$15`,
      [request.params.id, b.name, b.gender, b.category_key, b.qualification, b.experience_years, b.languages, b.base_price, b.radius_km, b.bio, b.photo_url, b.registration_no, b.available_today_from, b.status, b.locality],
    );
    if (!rowCount) throw new ApiError(404, "Professional not found.");
    return { ok: true };
  });

  // Live means families can find and book them. Taking a profile off live also takes them offline.
  app.patch<{ Params: { id: string } }>("/admin/professionals/:id/status", async (request) => {
    const me = await admin(request, "professionals");
    const { status } = z.object({ status: z.enum(["pending", "live", "hidden"]) }).parse(request.body);
    const before = (await pool.query("select p.name, p.status, pr.email from professionals p left join profiles pr on pr.id = p.profile_id where p.id = $1", [request.params.id])).rows[0];
    if (!before) throw new ApiError(404, "Professional not found.");
    await pool.query("update professionals set status = $2, online = online and $3 where id = $1", [request.params.id, status, status === "live"]);
    // Their first time going live is worth an email; later toggles are not.
    if (status === "live" && before.status === "pending") sendMail(before.email, medicoLive(before.name));
    await audit(me.id, `professional.${status}`, request.params.id);
    return { ok: true };
  });

  // Staff can switch a professional online or offline, for example when they cannot be reached.
  app.patch<{ Params: { id: string } }>("/admin/professionals/:id/online", async (request) => {
    const me = await admin(request, "professionals");
    const { online } = z.object({ online: z.boolean() }).parse(request.body);
    const pro = (await pool.query("select status from professionals where id = $1", [request.params.id])).rows[0];
    if (!pro) throw new ApiError(404, "Professional not found.");
    if (online && pro.status !== "live") throw new ApiError(409, "Make the profile live before switching them online.");
    await pool.query("update professionals set online = $2 where id = $1", [request.params.id, online]);
    await audit(me.id, online ? "professional.online" : "professional.offline", request.params.id);
    return { ok: true };
  });

  app.get("/admin/bookings", async (request) => {
    await admin(request, "bookings");
    const { rows } = await pool.query(
      `select b.id, b.patient_name, b.service_name, b.status, b.total_paise, b.payment_status, b.address->>'locality' locality, p.name professional,
        (select min(v.starts_at) from visits v where v.booking_id = b.id and v.status not in ('cancelled', 'skipped')) next_at
       from bookings b join professionals p on p.id = b.professional_id order by b.created_at desc`,
    );
    return rows;
  });

  app.get("/admin/payouts", async (request) => {
    await admin(request, "payouts");
    return weeklyEarnings(startOfIstWeek());
  });

  app.post<{ Params: { id: string } }>("/admin/payouts/:id/paid", async (request) => {
    await admin(request, "payouts");
    const week = startOfIstWeek();
    const row = (await weeklyEarnings(week, request.params.id))[0];
    if (!row) throw new ApiError(404, "Nothing to pay this week.");
    await pool.query("insert into payouts (professional_id, week_start, amount_paise) values ($1, $2::date, $3) on conflict do nothing", [row.id, new Date(week.getTime() + 19_800_000).toISOString().slice(0, 10), row.net * 100]);
    return { ok: true };
  });

  app.get("/admin/localities", async (request) => {
    await admin(request, "content");
    return (await pool.query(`select id, name, district, pincode, extensions.st_y(location::extensions.geometry) lat, extensions.st_x(location::extensions.geometry) lng from localities order by district, name`)).rows;
  });

  app.post("/admin/localities", async (request, reply) => {
    await admin(request, "content");
    const b = z.object({ name: z.string().trim().min(2), district: z.string().trim().min(2), pincode: z.string().regex(/^\d{6}$/), lat: z.coerce.number(), lng: z.coerce.number() }).parse(request.body);
    await pool.query(`insert into localities (name, district, pincode, location) values ($1,$2,$3, extensions.st_setsrid(extensions.st_makepoint($5,$4),4326)::extensions.geography)`, [b.name, b.district, b.pincode, b.lat, b.lng]);
    return reply.code(201).send({ ok: true });
  });

  app.delete<{ Params: { id: string } }>("/admin/localities/:id", async (request) => {
    await admin(request, "content");
    const used = await pool.query("select 1 from professionals where locality_id = $1 limit 1", [request.params.id]);
    if (used.rowCount) throw new ApiError(409, "A professional is based here, so it cannot be removed.");
    await pool.query("delete from localities where id = $1", [request.params.id]);
    return { ok: true };
  });

  app.get<{ Params: { table: string } }>("/admin/content/:table", async (request) => {
    await admin(request, "content");
    const t = contentTable(request.params.table);
    return (await pool.query(`select * from ${request.params.table} order by ${t.order}`)).rows;
  });

  app.post<{ Params: { table: string } }>("/admin/content/:table", async (request, reply) => {
    await admin(request, "content");
    const t = contentTable(request.params.table);
    const entries = pick(request.body, t.columns);
    if (!entries.length) throw new ApiError(400, "Nothing to save.");
    await pool.query(
      `insert into ${request.params.table} (${entries.map(([k]) => k).join(", ")}) values (${entries.map((_, i) => `$${i + 1}`).join(", ")})`,
      entries.map(([, v]) => v),
    );
    return reply.code(201).send({ ok: true });
  });

  app.patch<{ Params: { table: string; id: string } }>("/admin/content/:table/:id", async (request) => {
    await admin(request, "content");
    const t = contentTable(request.params.table);
    const entries = pick(request.body, t.columns);
    if (!entries.length) throw new ApiError(400, "Nothing to save.");
    await pool.query(
      `update ${request.params.table} set ${entries.map(([k], i) => `${k} = $${i + 2}`).join(", ")} where ${t.key} = $1`,
      [request.params.id, ...entries.map(([, v]) => v)],
    );
    return { ok: true };
  });

  app.delete<{ Params: { table: string; id: string } }>("/admin/content/:table/:id", async (request) => {
    await admin(request, "content");
    const t = contentTable(request.params.table);
    if (request.params.table === "categories") throw new ApiError(400, "Categories cannot be deleted.");
    await pool.query(`delete from ${request.params.table} where ${t.key} = $1`, [request.params.id]);
    return { ok: true };
  });

  app.get("/admin/staff", async (request) => {
    await admin(request, "staff");
    const { rows } = await pool.query(
      `select p.id, p.email, p.full_name, p.staff_roles, u.last_sign_in_at,
         exists (select 1 from auth.mfa_factors f where f.user_id = p.id and f.status = 'verified') two_step
       from profiles p join auth.users u on u.id = p.id where p.role = 'admin' order by p.created_at`,
    );
    return rows;
  });

  // Invited staff get a one-time password, then set up their 2-step code on first sign-in.
  app.post("/admin/staff", async (request, reply) => {
    await admin(request, "staff");
    const b = staffBody.extend({ email: z.string().trim().toLowerCase().email("Please enter a valid email address."), full_name: z.string().trim().min(2, "Please enter their name.") }).parse(request.body);
    const password = randomBytes(9).toString("base64url");
    const found = (await pool.query("select id from auth.users where lower(email) = $1", [b.email])).rows[0];
    const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users${found ? `/${found.id}` : ""}`, {
      method: found ? "PUT" : "POST",
      headers: { apikey: env.SUPABASE_SECRET_KEY, Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: b.email, password, email_confirm: true }),
    });
    if (!res.ok) throw new ApiError(502, "Could not create the staff login. Please try again.");
    const id = found?.id ?? ((await res.json()) as { id: string }).id;
    await pool.query(
      `insert into profiles (id, email, full_name, role, staff_roles, terms_accepted_at) values ($1, $2, $3, 'admin', $4, now())
       on conflict (id) do update set role = 'admin', staff_roles = excluded.staff_roles, full_name = coalesce(nullif(profiles.full_name, ''), excluded.full_name)`,
      [id, b.email, b.full_name, b.roles],
    );
    return reply.code(201).send({ id, email: b.email, password });
  });

  app.patch<{ Params: { id: string } }>("/admin/staff/:id", async (request) => {
    const me = await admin(request, "staff");
    const b = staffBody.parse(request.body);
    if (request.params.id === me.id && !b.roles.includes("super_admin")) throw new ApiError(400, "You cannot remove your own super admin role.");
    const { rowCount } = await pool.query("update profiles set staff_roles = $2 where id = $1 and role = 'admin'", [request.params.id, b.roles]);
    if (!rowCount) throw new ApiError(404, "Staff member not found.");
    return { ok: true };
  });

  app.delete<{ Params: { id: string } }>("/admin/staff/:id", async (request) => {
    const me = await admin(request, "staff");
    if (request.params.id === me.id) throw new ApiError(400, "You cannot remove yourself.");
    await pool.query("update profiles set role = 'patient', staff_roles = '{}' where id = $1 and role = 'admin'", [request.params.id]);
    return { ok: true };
  });

  app.get("/admin/audit", async (request) => {
    await admin(request, "audit");
    const { rows } = await pool.query(
      `select a.id, a.action, a.subject, a.created_at, p.email actor_email, p.full_name actor_name
       from audit_log a left join profiles p on p.id = a.actor order by a.created_at desc limit 300`,
    );
    return rows;
  });
}

import { professionByLabel } from "@medico/shared";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { audit, requireStaff, STAFF_ROLES, type Module } from "../auth";
import { pool } from "../db";
import { env } from "../env";
import { ApiError } from "../errors";
import { signedDownload } from "../storage";
import { formatIst, startOfIstDay, startOfIstWeek } from "../time";
import { weeklyEarnings } from "./earnings";

const STAGES = ["documents", "council", "police", "interview"];
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
    await admin(request, "applications");
    const { action, note } = z
      .object({ action: z.enum(["pass", "ask", "reject"]), note: z.string().trim().default("") })
      .refine((b) => b.action === "pass" || b.note, { message: "Please write what the applicant needs to know." })
      .parse(request.body);
    const application = (await pool.query("select * from applications where id = $1", [request.params.id])).rows[0];
    if (!application) throw new ApiError(404, "Application not found.");
    if (["approved", "rejected"].includes(application.stage)) throw new ApiError(409, "This application is already decided.");
    if (action === "reject" || action === "ask") {
      const stage = action === "reject" ? "rejected" : "info_needed";
      await pool.query("update applications set stage = $2, decision_note = $3 where id = $1", [application.id, stage, note]);
      return { stage };
    }
    if (application.stage === "info_needed") throw new ApiError(409, "Waiting for the applicant to send the missing details.");
    const next = STAGES[STAGES.indexOf(application.stage) + 1];
    if (next) {
      await pool.query("update applications set stage = $2 where id = $1", [application.id, next]);
      return { stage: next };
    }
    if (application.stage !== "interview") throw new ApiError(409, "This application is already decided.");
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

  app.patch<{ Params: { id: string } }>("/admin/professionals/:id/status", async (request) => {
    await admin(request, "professionals");
    const { status } = z.object({ status: z.enum(["pending", "live", "hidden"]) }).parse(request.body);
    await pool.query("update professionals set status = $2 where id = $1", [request.params.id, status]);
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

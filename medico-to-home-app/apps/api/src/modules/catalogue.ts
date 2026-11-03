import { randomUUID } from "node:crypto";
import { GENDERS, missingForApplication, professionByLabel, servicePrice } from "@medico/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireMember } from "../auth";
import { pool } from "../db";
import { ApiError } from "../errors";
import { MAX_BYTES, safeFileName, signedUpload } from "../storage";
import { startOfIstDay } from "../time";

const initials = (name: string) => {
  const [a = "", b = ""] = name.replace("Dr. ", "").split(" ");
  return (a.charAt(0) + b.charAt(0)).toUpperCase();
};

const COVERAGE_KM = 30;

export async function catalogueRoutes(app: FastifyInstance) {
  app.get("/catalogue", async () => {
    const [cats, svcs, locs, pros, revs, ther, faqs] = await Promise.all([
      pool.query("select * from categories order by sort_order"),
      pool.query("select * from service_templates order by sort_order, id"),
      pool.query(`select name, district, pincode, extensions.st_y(location::extensions.geometry) lat, extensions.st_x(location::extensions.geometry) lng from localities order by id`),
      pool.query(`select p.*, l.name locality from professionals p join localities l on l.id = p.locality_id where p.status = 'live' order by p.id`),
      pool.query(`select r.* from reviews r join professionals p on p.id = r.professional_id where p.status = 'live' order by r.created_at desc`),
      pool.query("select * from therapies order by sort_order"),
      pool.query("select question, answer from faqs order by sort_order, id"),
    ]);

    const bySvc = new Map<string, typeof svcs.rows>();
    for (const s of svcs.rows) bySvc.set(s.category_key, [...(bySvc.get(s.category_key) ?? []), s]);
    const byRev = new Map<string, typeof revs.rows>();
    for (const r of revs.rows) byRev.set(r.professional_id, [...(byRev.get(r.professional_id) ?? []), r]);

    return {
      CATS: Object.fromEntries(
        cats.rows.map((c) => [
          c.key,
          { label: c.label, one: c.one, plural: c.plural, brand: c.brand, unit: c.unit, plan: c.plan_default, allowPlan: c.allow_plan, mode: c.mode, reg: c.registration_label },
        ]),
      ),
      ORDER: cats.rows.map((c) => c.key),
      LOCS: Object.fromEntries(locs.rows.map((l) => [l.name, [l.lat, l.lng, l.district, l.pincode]])),
      pros: pros.rows.map((p) => ({
        id: p.id,
        img: p.photo_url,
        name: p.name,
        g: p.gender,
        cat: p.category_key,
        qual: p.qualification,
        exp: p.experience_years,
        rating: Number(p.rating),
        reviews: p.review_count,
        locality: p.locality,
        langs: p.languages,
        price: p.base_price,
        today: p.available_today_from,
        initials: initials(p.name),
        reg: `${cats.rows.find((c) => c.key === p.category_key)?.registration_label ?? ""} ${p.registration_no}`.trim(),
        bio: p.bio,
        radius: p.radius_km,
        svcs: (bySvc.get(p.category_key) ?? []).map((s) => ({ n: s.name, p: servicePrice(p.base_price, Number(s.multiplier)), d: s.duration })),
        revs: (byRev.get(p.id) ?? []).slice(0, 4).map((r) => ({ name: r.author_name, place: r.place, stars: r.stars, text: r.body })),
      })),
      THER: ther.rows.map((t) => ({ id: t.id, label: t.label, cat: t.category_key, brand: t.brand, helps: t.helps, steps: t.steps, plan: t.plan })),
      faqs: faqs.rows,
    };
  });

  app.get("/localities/nearest", async (request) => {
    const query = z.object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180) }).parse(request.query);
    const { rows } = await pool.query(
      `select name, district, extensions.st_distance(location, extensions.st_setsrid(extensions.st_makepoint($2, $1), 4326)::extensions.geography) / 1000 km
       from localities order by location operator(extensions.<->) extensions.st_setsrid(extensions.st_makepoint($2, $1), 4326)::extensions.geography limit 1`,
      [query.lat, query.lng],
    );
    const nearest = rows[0];
    if (!nearest) throw new ApiError(404, "No service areas yet.");
    return { name: nearest.name, district: nearest.district, km: Math.round(nearest.km * 10) / 10, covered: nearest.km <= COVERAGE_KM };
  });

  // Real bookings that must block the dummy slots.
  app.get<{ Params: { id: string } }>("/professionals/:id/booked", async (request) => {
    const { rows } = await pool.query(
      `select starts_at, blocked_until from visits
       where professional_id = $1 and blocked_until >= $2 and status not in ('skipped', 'cancelled', 'no_show')`,
      [request.params.id, startOfIstDay()],
    );
    return rows.map((r) => [new Date(r.starts_at).getTime(), new Date(r.blocked_until).getTime()]);
  });

  // Applying needs a signed-in account; approval unlocks professional mode on that same account.
  const applicationBody = z.object({
    name: z.string().trim().min(2, "Please enter your full name."),
    phone: z.string().trim().regex(/^(\+?91)?\s*\d{10}$/, "Please enter a 10-digit mobile number."),
    gender: z.enum(GENDERS as [string, ...string[]], { message: "Please choose your gender." }),
    profession: z.string().min(1),
    district: z.enum(["Kozhikode", "Malappuram"]),
    details: z.record(z.string(), z.union([z.string().trim().max(1000), z.array(z.string().max(100)).max(20)])),
    documents: z.array(z.object({ kind: z.string(), fileName: z.string().max(200), path: z.string(), size: z.number().int() })).max(20),
  });

  // Checks everything the shared form rules require, and that every file belongs to this applicant.
  const parseApplication = (user: { id: string }, raw: unknown) => {
    const body = applicationBody.parse(raw);
    const profession = professionByLabel(body.profession);
    if (!profession) throw new ApiError(400, "Please choose your profession.");
    const kinds = new Set(profession.documents.map((d) => d.key));
    if (body.documents.some((d) => !kinds.has(d.kind) || !d.path.startsWith(`applications/${user.id}/`))) throw new ApiError(400, "One of the files is not valid. Please upload it again.");
    const missing = missingForApplication(body.profession, body.details, body.documents);
    if (missing.length) throw new ApiError(400, `Please complete: ${missing.join(", ")}.`);
    return { ...body, registration: String(body.details.registration_no ?? body.details.licence_no ?? "") };
  };

  app.post("/applications/documents/sign", async (request) => {
    const user = await requireMember(request);
    const body = z.object({ kind: z.string().min(1).max(40), fileName: z.string().min(1).max(200), size: z.number().int().positive().max(MAX_BYTES, "Files must be 20 MB or smaller.") }).parse(request.body);
    const path = `applications/${user.id}/${body.kind}-${randomUUID()}-${safeFileName(body.fileName)}`;
    return { uploadUrl: await signedUpload(path), path };
  });

  app.get("/applications/mine", async (request) => {
    const user = await requireMember(request);
    const { rows } = await pool.query(
      "select id, name, phone, gender, profession, district, details, documents, stage, decision_note, created_at from applications where profile_id = $1 order by created_at desc limit 1",
      [user.id],
    );
    return rows[0] ?? null;
  });

  app.post("/applications", async (request, reply) => {
    const user = await requireMember(request);
    const body = parseApplication(user, request.body);
    const open = await pool.query("select 1 from applications where profile_id = $1 and stage <> 'rejected'", [user.id]);
    if (open.rowCount) throw new ApiError(409, "You have already applied. We will contact you soon.");
    await pool.query(
      `insert into applications (name, phone, gender, email, profession, district, registration_no, details, documents, profile_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [body.name, body.phone, body.gender, user.email ?? "", body.profession, body.district, body.registration, body.details, JSON.stringify(body.documents), user.id],
    );
    return reply.code(201).send({ ok: true });
  });

  // After "Info needed", the applicant fixes the details and the application returns to review.
  app.put("/applications/mine", async (request) => {
    const user = await requireMember(request);
    const body = parseApplication(user, request.body);
    const { rowCount } = await pool.query(
      `update applications set name = $2, phone = $3, gender = $4, profession = $5, district = $6, registration_no = $7, details = $8, documents = $9,
         stage = 'documents', decision_note = '', updated_at = now()
       where profile_id = $1 and stage = 'info_needed'`,
      [user.id, body.name, body.phone, body.gender, body.profession, body.district, body.registration, body.details, JSON.stringify(body.documents)],
    );
    if (!rowCount) throw new ApiError(409, "There is nothing to update on your application.");
    return { ok: true };
  });
}

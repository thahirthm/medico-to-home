import { hasTimetable, offeredServices, servicePrice, weekdayOf, type MedicoService } from "@medico/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { pool } from "../db";
import { ApiError } from "../errors";
import { reverseGeocode } from "../geocode";
import { startOfIstDay } from "../time";

const initials = (name: string) => {
  const [a = "", b = ""] = name.replace("Dr. ", "").split(" ");
  return (a.charAt(0) + b.charAt(0)).toUpperCase();
};

const COVERAGE_KM = 30;

// Today's date key in India, e.g. "2026-11-5".
const istToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()).split("-").map(Number).join("-");

// A real timetable decides "available today": round the clock, or the first time open today.
function todayFrom(p: { weekly: Record<string, string[]>; all_day: boolean; available_today_from: string }) {
  const t = { weekly: p.weekly, allDay: p.all_day };
  if (!hasTimetable(t)) return p.available_today_from;
  return p.all_day ? "24×7" : (p.weekly[weekdayOf(istToday())]?.[0] ?? "");
}

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
        today: todayFrom(p),
        week: hasTimetable({ weekly: p.weekly, allDay: p.all_day }) ? p.weekly : null,
        allDay: p.all_day,
        towns: p.service_towns,
        initials: initials(p.name),
        reg: `${cats.rows.find((c) => c.key === p.category_key)?.registration_label ?? ""} ${p.registration_no}`.trim(),
        bio: p.bio,
        radius: p.radius_km,
        // Their own services and charges when they set them, else the category's at their base price. o: given over video.
        svcs: offeredServices(p.category_key, p.base_price, p.services as MedicoService[],
          (bySvc.get(p.category_key) ?? []).map((s) => ({ name: s.name, price: servicePrice(p.base_price, Number(s.multiplier)), duration: s.duration })),
        ).map((s) => ({ n: s.name, p: s.price, d: s.duration, ...(s.online ? { o: true } : {}) })),
        revs: (byRev.get(p.id) ?? []).slice(0, 4).map((r) => ({ name: r.author_name, place: r.place, stars: r.stars, text: r.body })),
      })),
      THER: ther.rows.map((t) => ({ id: t.id, label: t.label, cat: t.category_key, brand: t.brand, helps: t.helps, steps: t.steps, plan: t.plan })),
      faqs: faqs.rows,
    };
  });

  // Where the user is: a readable place for their exact position, and the closest areas we serve.
  app.get("/localities/nearest", { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } }, async (request) => {
    const query = z.object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180) }).parse(request.query);
    const [areas, place] = await Promise.all([
      pool.query(
        `select name, district, extensions.st_distance(location, extensions.st_setsrid(extensions.st_makepoint($2, $1), 4326)::extensions.geography) / 1000 km
         from localities order by location operator(extensions.<->) extensions.st_setsrid(extensions.st_makepoint($2, $1), 4326)::extensions.geography limit 5`,
        [query.lat, query.lng],
      ),
      reverseGeocode(query.lat, query.lng),
    ]);
    const nearest = areas.rows.map((r) => ({ name: r.name as string, district: r.district as string, km: Math.round(r.km * 10) / 10 }));
    if (!nearest[0]) throw new ApiError(404, "No service areas yet.");
    return { place, nearest, covered: nearest[0].km <= COVERAGE_KM };
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
}

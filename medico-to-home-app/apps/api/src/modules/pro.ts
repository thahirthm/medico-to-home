import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { audit, requireUser, type User } from "../auth";
import { pool } from "../db";
import { ApiError } from "../errors";
import { formatIst, startOfIstDay, startOfIstWeek } from "../time";
import { COMMISSION_RATE, weeklyEarnings } from "./earnings";

const NEXT: Record<string, string> = { scheduled: "accepted", accepted: "on_the_way", on_the_way: "arrived", arrived: "in_session", in_session: "completed" };
// An online consultation has no travel: once accepted, the call starts the session.
const NEXT_ONLINE: Record<string, string> = { scheduled: "accepted", accepted: "in_session", in_session: "completed" };
const DAY_MS = 86_400_000;
const UPCOMING_DAYS = 14;

async function professional(user: User) {
  const { rows } = await pool.query(
    `select p.*, l.name locality, c.one role from professionals p join localities l on l.id = p.locality_id join categories c on c.key = p.category_key where p.profile_id = $1`,
    [user.id],
  );
  if (!rows[0]) throw new ApiError(403, "This account is not linked to a professional profile.");
  return rows[0];
}

export async function proRoutes(app: FastifyInstance) {
  app.get("/pro/me", async (request) => {
    const pro = await professional(await requireUser(request));
    return { name: pro.name, role: pro.role, qualification: pro.qualification, locality: pro.locality, radius: pro.radius_km, languages: pro.languages, status: pro.status };
  });

  // The dashboard: online switch, today's schedule, new requests waiting for a reply, and this week's earnings.
  app.get("/pro/dashboard", async (request) => {
    const pro = await professional(await requireUser(request));
    const from = startOfIstDay();
    const [today, requests, week] = await Promise.all([
      pool.query(
        `select v.id, v.starts_at, v.status, b.patient_name, b.service_name, case when b.mode = 'online' then 'Online video' else b.address->>'locality' end locality
         from visits v join bookings b on b.id = v.booking_id
         where v.professional_id = $1 and v.starts_at >= $2 and v.starts_at < $3 and v.status not in ('skipped', 'cancelled') order by v.starts_at`,
        [pro.id, from, new Date(from.getTime() + DAY_MS)],
      ),
      pool.query(
        `select v.id, v.starts_at, b.patient_name, b.service_name, case when b.mode = 'online' then 'Online video' else b.address->>'locality' end locality, round((b.subtotal_paise - b.discount_paise)::numeric / b.sessions / 100) fee
         from visits v join bookings b on b.id = v.booking_id
         where v.professional_id = $1 and v.status = 'scheduled' and v.starts_at >= $2 order by v.starts_at limit 10`,
        [pro.id, new Date()],
      ),
      weeklyEarnings(startOfIstWeek(), pro.id),
    ]);
    const time = (d: Date) => formatIst(d, { hour: "numeric", minute: "2-digit", hour12: true });
    const day = (d: Date) => formatIst(d, { weekday: "short", day: "numeric", month: "short" });
    return {
      name: pro.name, role: pro.role, photo: pro.photo_url, status: pro.status, online: pro.online === true,
      rating: Number(pro.rating), reviews: pro.review_count, locality: pro.locality,
      today: today.rows.map((v) => ({ id: v.id, time: time(new Date(v.starts_at)), patient: v.patient_name, service: v.service_name, locality: v.locality ?? "", status: v.status })),
      requests: requests.rows.map((v) => ({ id: v.id, when: `${day(new Date(v.starts_at))}, ${time(new Date(v.starts_at))}`, patient: v.patient_name, service: v.service_name, locality: v.locality ?? "", fee: Number(v.fee) })),
      week: { visits: week[0]?.visits ?? 0, net: week[0]?.net ?? 0 },
    };
  });

  // Online means families can send new requests now; offline pauses them.
  app.put("/pro/online", async (request) => {
    const pro = await professional(await requireUser(request));
    const { online } = z.object({ online: z.boolean() }).parse(request.body);
    if (online && pro.status !== "live") throw new ApiError(409, "You can go online once our team has made your profile live.");
    await pool.query("update professionals set online = $2 where id = $1", [pro.id, online]);
    return { online };
  });

  app.get("/pro/visits", async (request) => {
    const user = await requireUser(request);
    const pro = await professional(user);
    const from = startOfIstDay();
    const { rows } = await pool.query(
      `select v.*, b.patient_name, b.service_name, b.sessions, b.address, b.mode, b.notes booking_notes, b.share_records, b.is_plan,
         b.subtotal_paise, b.discount_paise, pa.age, pa.conditions, pa.allergies, pa.medications, pa.share_records patient_shares
       from visits v join bookings b on b.id = v.booking_id left join patients pa on pa.id = b.patient_id
       where v.professional_id = $1 and v.starts_at >= $2 and v.starts_at < $3 and v.status not in ('skipped', 'cancelled') order by v.starts_at`,
      [pro.id, from, new Date(from.getTime() + UPCOMING_DAYS * DAY_MS)],
    );
    const shared = rows.filter((v) => v.share_records && v.patient_shares);
    if (shared.length) await audit(user.id, "records.read", `visits ${shared.map((v) => v.id).join(",")}`);
    return rows.map((v) => {
      const a = v.address ?? {};
      const open = v.share_records && v.patient_shares;
      return {
        id: v.id,
        time: `${new Date(v.starts_at) < new Date(from.getTime() + DAY_MS) ? "Today" : formatIst(new Date(v.starts_at), { weekday: "short", day: "numeric", month: "short" })}, ${formatIst(new Date(v.starts_at), { hour: "numeric", minute: "2-digit", hour12: true })}`,
        patient: v.patient_name,
        age: v.age,
        service: v.is_plan ? `${v.service_name} · session ${v.sequence} of ${v.sessions}` : v.service_name,
        address: [a.house, a.street, a.landmark, a.locality].filter(Boolean).join(", "),
        online: v.mode === "online",
        bookingId: v.booking_id,
        notes: v.booking_notes,
        fee: Math.round((Number(v.subtotal_paise) - Number(v.discount_paise)) / v.sessions / 100),
        status: v.status,
        records: open ? { conditions: v.conditions, allergies: v.allergies, medications: v.medications } : null,
      };
    });
  });

  app.get("/pro/schedule", async (request) => {
    const pro = await professional(await requireUser(request));
    const from = startOfIstDay();
    const { rows } = await pool.query(
      `select starts_at from visits where professional_id = $1 and starts_at >= $2 and starts_at < $3 and status not in ('skipped', 'cancelled', 'no_show')`,
      [pro.id, from, new Date(from.getTime() + 7 * DAY_MS)],
    );
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(from.getTime() + i * DAY_MS);
      const end = day.getTime() + DAY_MS;
      return {
        day: formatIst(day, { weekday: "short" }),
        date: formatIst(day, { day: "numeric" }),
        visits: rows.filter((r) => { const t = new Date(r.starts_at).getTime(); return t >= day.getTime() && t < end; }).length,
      };
    });
  });

  app.get("/pro/earnings", async (request) => {
    const pro = await professional(await requireUser(request));
    const row = (await weeklyEarnings(startOfIstWeek(), pro.id))[0];
    return { visits: row?.visits ?? 0, gross: row?.gross ?? 0, net: row?.net ?? 0, commissionRate: COMMISSION_RATE };
  });

  app.post<{ Params: { id: string } }>("/pro/visits/:id/status", async (request) => {
    const user = await requireUser(request);
    const pro = await professional(user);
    const body = z.object({ notes: z.string().default("") }).parse(request.body ?? {});
    const { rows } = await pool.query(
      `select v.*, b.patient_id, b.service_name, b.mode from visits v join bookings b on b.id = v.booking_id where v.id = $1 and v.professional_id = $2`,
      [request.params.id, pro.id],
    );
    const visit = rows[0];
    if (!visit) throw new ApiError(404, "Visit not found.");
    const next = (visit.mode === "online" ? NEXT_ONLINE : NEXT)[visit.status];
    if (!next) throw new ApiError(409, "This visit is already finished.");

    await pool.query("update visits set status = $2, notes = case when $3 = '' then notes else $3 end where id = $1", [visit.id, next, body.notes]);
    await pool.query("insert into visit_events (visit_id, status, actor) values ($1, $2, $3)", [visit.id, next, user.id]);
    if (next === "in_session") await pool.query("update bookings set status = 'active' where id = $1 and status = 'confirmed'", [visit.booking_id]);
    if (next === "completed") {
      const left = await pool.query("select 1 from visits where booking_id = $1 and status not in ('completed', 'skipped', 'cancelled', 'no_show') limit 1", [visit.booking_id]);
      if (!left.rowCount) await pool.query("update bookings set status = 'completed' where id = $1", [visit.booking_id]);
      if (visit.patient_id) {
        const entry = { date: formatIst(new Date(), { day: "2-digit", month: "short", year: "numeric" }), title: visit.service_name, by: pro.name, note: body.notes };
        await pool.query("update patients set history = $2::jsonb || history where id = $1", [visit.patient_id, JSON.stringify([entry])]);
      }
    }
    return { status: next };
  });
}

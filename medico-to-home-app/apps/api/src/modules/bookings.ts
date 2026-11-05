import { randomInt } from "node:crypto";
import { carePlanDayPrice, hasTimetable, isOpen, offeredServices, quote, servicePrice, type CareHours, type MedicoService } from "@medico/shared";
import type { FastifyInstance } from "fastify";
import type { PoolClient } from "pg";
import { z } from "zod";
import { requireMember, requireUser, type User } from "../auth";
import { pool } from "../db";
import { ApiError } from "../errors";
import { adminEmails, sendMail } from "../mail/send";
import { bookingForAdmin, bookingForPatient, bookingForProfessional } from "../mail/templates";
import { formatIst, istDate, SLOTS, startOfIstDay } from "../time";

const TRAVEL_BUFFER_MIN = 30;
// Between back-to-back video calls there is no travel, just a short break.
const CALL_BUFFER_MIN = 10;
const FREE_CANCEL_HOURS = 4;
const MAX_VISITS = 60;
const paise = (rupees: number) => rupees * 100;

const bookingBody = z.object({
  professionalId: z.string(),
  serviceIndex: z.number().int().min(0),
  plan: z.boolean(),
  dates: z.array(z.string().regex(/^\d{4}-\d{1,2}-\d{1,2}$/)).min(1).max(MAX_VISITS),
  slot: z.enum(SLOTS as [string, ...string[]]),
  hours: z.union([z.literal(4), z.literal(8), z.literal(12), z.literal(24)]).default(12),
  patient: z.object({ id: z.string().uuid().optional(), name: z.string().trim().min(1, "Please enter the patient's name."), age: z.string().default(""), gender: z.string().default(""), relation: z.string().default("Me") }),
  // Not needed for an online consultation.
  address: z.object({ addressId: z.string().uuid().optional(), label: z.string().default("Home"), house: z.string().trim().min(1, "Please enter your house or flat name."), street: z.string().default(""), landmark: z.string().default(""), locality: z.string().trim().min(1, "Please choose your area."), pincode: z.string().trim().regex(/^\d{6}$/, "Please enter a 6-digit pincode.") }).optional(),
  notes: z.string().default(""),
  share: z.boolean().default(true),
  payMethod: z.enum(["gpay", "phonepe", "paytm", "card", "later"]),
});

const PAY: Record<string, string> = { later: "Pay after the first visit", gpay: "Google Pay", phonepe: "PhonePe", paytm: "Paytm", card: "Card" };
const inr = (rupees: number) => "₹" + Math.round(rupees).toLocaleString("en-IN");

// The booking emails: one to whoever booked, one to the Medico (if their listing has an account) and one to the team.
async function emailBooking(id: string, user: User, body: z.infer<typeof bookingBody>, pro: { name: string; profile_id: string | null; category_key: string }, service: string, sessions: number, total: number, firstStart: Date, online: boolean) {
  const [me, proAccount, category] = await Promise.all([
    pool.query("select full_name, email, phone from profiles where id = $1", [user.id]),
    pro.profile_id ? pool.query("select email from profiles where id = $1", [pro.profile_id]) : Promise.resolve({ rows: [] }),
    pool.query("select one from categories where key = $1", [pro.category_key]),
  ]);
  const a = body.address;
  const mail = {
    id, patient: body.patient.name, bookedBy: me.rows[0]?.full_name || body.patient.name, bookedByEmail: me.rows[0]?.email || user.email, bookedByPhone: me.rows[0]?.phone || "",
    professional: pro.name, role: category.rows[0]?.one ?? "", service, sessions, plan: body.plan,
    firstVisit: formatIst(firstStart, { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }),
    address: online || !a ? "Online video consultation. Join from My bookings on medicotohome.com." : [a.house, a.street, a.landmark, a.locality, a.pincode].filter(Boolean).join(", "), total: inr(total), payment: PAY[body.payMethod] ?? body.payMethod, notes: body.notes,
  };
  sendMail(mail.bookedByEmail, bookingForPatient(mail));
  sendMail(proAccount.rows[0]?.email, bookingForProfessional(mail));
  sendMail(adminEmails(), bookingForAdmin(mail));
}

const durationMinutes = (label: string) => Number(/(\d+)/.exec(label.includes("min") ? label : "")?.[1] ?? 60);

async function patientFor(client: PoolClient, user: User, p: z.infer<typeof bookingBody>["patient"]) {
  if (p.id) {
    const { rows } = await client.query("select id from patients where id = $1 and owner_id = $2", [p.id, user.id]);
    if (!rows[0]) throw new ApiError(404, "Family member not found.");
    await client.query("update patients set age = $2, gender = $3 where id = $1", [p.id, p.age, p.gender]);
    return p.id;
  }
  if (p.relation === "Me") {
    const self = await client.query("update patients set name = $2, age = $3, gender = $4 where owner_id = $1 and relation = 'Me' returning id", [user.id, p.name, p.age, p.gender]);
    if (self.rows[0]) return self.rows[0].id as string;
  }
  const { rows } = await client.query("insert into patients (owner_id, relation, name, age, gender) values ($1,$2,$3,$4,$5) returning id", [user.id, p.relation, p.name, p.age, p.gender]);
  return rows[0].id as string;
}

export async function bookingRoutes(app: FastifyInstance) {
  app.post("/bookings", async (request, reply) => {
    const user = await requireMember(request);
    const body = bookingBody.parse(request.body);

    const pro = (await pool.query(`select p.*, c.mode, c.allow_plan from professionals p join categories c on c.key = p.category_key where p.id = $1 and p.status = 'live'`, [body.professionalId])).rows[0];
    if (!pro) throw new ApiError(404, "This professional is not available.");
    if (body.plan && !pro.allow_plan) throw new ApiError(400, "Plans are not offered for this service.");
    // The same list the profile shows: their own services and charges, else the category's at their base price.
    const own = pro.services as MedicoService[];
    const templates = own.length ? [] : (await pool.query("select * from service_templates where category_key = $1 order by sort_order, id", [pro.category_key])).rows
      .map((s) => ({ name: s.name as string, duration: s.duration as string, price: servicePrice(pro.base_price, Number(s.multiplier)) }));
    const service = offeredServices(pro.category_key, pro.base_price, own, templates)[body.serviceIndex];
    if (!service) throw new ApiError(400, "Please choose a service.");
    const online = !!service.online;
    if (online && body.plan) throw new ApiError(400, "Online consultations are booked one at a time.");
    if (!online && !body.address) throw new ApiError(400, "Please add the address for the visit.");
    if (!body.plan && body.dates.length !== 1) throw new ApiError(400, "A single visit has one date.");
    const timetable = { weekly: pro.weekly, allDay: pro.all_day };
    if (hasTimetable(timetable) && body.dates.some((d) => !isOpen(timetable, d, body.slot))) {
      throw new ApiError(400, `${pro.name} does not work at ${body.slot} on one of those days. Please choose another time.`);
    }

    const isCare = pro.mode === "care";
    const base = service.price;
    const unit = isCare && body.plan ? carePlanDayPrice(base, body.hours as CareHours) : base;
    const price = quote(unit, body.dates.length, body.plan);

    const minutes = isCare && !online ? (body.plan ? body.hours : 12) * 60 : durationMinutes(service.duration);
    const buffer = online ? CALL_BUFFER_MIN : TRAVEL_BUFFER_MIN;
    const today = startOfIstDay();
    const visits = body.dates.map((date) => {
      const starts = istDate(date, body.slot);
      if (starts < today) throw new ApiError(400, "Please choose a date from today onwards.");
      const ends = new Date(starts.getTime() + minutes * 60_000);
      return { starts, ends, blocked: new Date(ends.getTime() + buffer * 60_000) };
    });

    const client = await pool.connect();
    const id = `MTH-${randomInt(100000, 1000000)}`;
    try {
      await client.query("begin");
      const patientId = await patientFor(client, user, body.patient);
      if (body.patient.relation === "Me") {
        await client.query("update profiles set full_name = $2 where id = $1 and full_name = ''", [user.id, body.patient.name]);
      }
      const a = online ? undefined : body.address;
      if (a && !a.addressId) {
        await client.query("insert into addresses (owner_id, label, house, street, landmark, locality, pincode) values ($1,$2,$3,$4,$5,$6,$7)", [user.id, a.label, a.house, a.street, a.landmark, a.locality, a.pincode]);
      }
      await client.query(
        `insert into bookings (id, owner_id, patient_id, patient_name, professional_id, service_name, is_plan, sessions, unit_paise, subtotal_paise,
          discount_paise, platform_fee_paise, gst_paise, total_paise, pay_method, address, notes, share_records, mode)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [id, user.id, patientId, body.patient.name, pro.id, service.name, body.plan, price.sessions, paise(price.unitPrice), paise(price.subtotal), paise(price.discount), paise(price.platformFee), paise(price.gst), paise(price.total), body.payMethod, JSON.stringify(a ?? {}), body.notes, body.share, online ? "online" : "home"],
      );
      for (const [i, v] of visits.entries()) {
        await client.query("insert into visits (booking_id, professional_id, sequence, starts_at, ends_at, blocked_until) values ($1,$2,$3,$4,$5,$6)", [id, pro.id, i + 1, v.starts, v.ends, v.blocked]);
      }
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      if ((error as { code?: string }).code === "23P01") throw new ApiError(409, "That time was just taken. Please choose another slot.");
      throw error;
    } finally {
      client.release();
    }
    emailBooking(id, user, body, pro, service.name, price.sessions, price.total, visits[0]!.starts, online).catch((e: Error) => request.log.error(e, "booking emails"));
    return reply.code(201).send({ id, total: price.total });
  });

  const summary = `select b.*, p.name professional_name, p.photo_url, c.one role,
      exists (select 1 from reviews r join visits rv on rv.id = r.visit_id where rv.booking_id = b.id) reviewed,
      (select json_agg(json_build_object('id', v.id, 'sequence', v.sequence, 'starts_at', v.starts_at, 'status', v.status, 'eta', v.eta_minutes) order by v.sequence) from visits v where v.booking_id = b.id) visits
    from bookings b join professionals p on p.id = b.professional_id join categories c on c.key = p.category_key`;

  app.get("/bookings", async (request) => {
    const user = await requireUser(request);
    const { rows } = await pool.query(`${summary} where b.owner_id = $1 order by b.created_at desc`, [user.id]);
    return rows;
  });

  app.get<{ Params: { id: string } }>("/bookings/:id", async (request) => {
    const user = await requireUser(request);
    const { rows } = await pool.query(`${summary} where b.id = $1 and b.owner_id = $2`, [request.params.id, user.id]);
    if (!rows[0]) throw new ApiError(404, "Booking not found.");
    return rows[0];
  });

  app.post<{ Params: { id: string } }>("/bookings/:id/cancel", async (request) => {
    const user = await requireUser(request);
    const { rows } = await pool.query("select id from bookings where id = $1 and owner_id = $2 and status in ('confirmed', 'active', 'pending_payment')", [request.params.id, user.id]);
    if (!rows[0]) throw new ApiError(404, "This booking cannot be cancelled.");
    const cutoff = new Date(Date.now() + FREE_CANCEL_HOURS * 3_600_000);
    const open = await pool.query("select starts_at from visits where booking_id = $1 and status in ('scheduled', 'accepted') order by starts_at limit 1", [request.params.id]);
    if (open.rows[0] && new Date(open.rows[0].starts_at) < cutoff) {
      throw new ApiError(409, `The next visit is ${formatIst(new Date(open.rows[0].starts_at), { dateStyle: "medium", timeStyle: "short" })}. Free cancellation ends 4 hours before a visit.`);
    }
    await pool.query("update visits set status = 'cancelled' where booking_id = $1 and status in ('scheduled', 'accepted')", [request.params.id]);
    const done = await pool.query("select 1 from visits where booking_id = $1 and status = 'completed' limit 1", [request.params.id]);
    await pool.query("update bookings set status = $2 where id = $1", [request.params.id, done.rowCount ? "completed" : "cancelled"]);
    return { ok: true };
  });

  app.post<{ Params: { id: string } }>("/visits/:id/review", async (request, reply) => {
    const user = await requireUser(request);
    const body = z.object({ stars: z.number().int().min(1).max(5), text: z.string().default("") }).parse(request.body);
    const { rows } = await pool.query(
      `select v.id, v.professional_id, b.patient_name, b.address->>'locality' place from visits v join bookings b on b.id = v.booking_id
       where v.id = $1 and b.owner_id = $2 and v.status = 'completed'`,
      [request.params.id, user.id],
    );
    const visit = rows[0];
    if (!visit) throw new ApiError(404, "You can review a visit after it is completed.");
    await pool.query("insert into reviews (professional_id, visit_id, author_name, place, stars, body) values ($1,$2,$3,$4,$5,$6) on conflict (visit_id) do nothing", [visit.professional_id, visit.id, visit.patient_name, visit.place ?? "", body.stars, body.text]);
    await pool.query(
      `update professionals p set review_count = s.n, rating = round(s.avg, 1)
       from (select count(*) n, avg(stars) avg from reviews where professional_id = $1 and not is_demo) s where p.id = $1 and s.n > 0`,
      [visit.professional_id],
    );
    return reply.code(201).send({ ok: true });
  });
}

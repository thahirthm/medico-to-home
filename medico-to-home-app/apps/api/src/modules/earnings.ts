import { pool } from "../db";

export const COMMISSION_RATE = 0.12;
const DAY_MS = 86_400_000;

/** Completed-visit earnings for one Monday-to-Sunday week, in rupees. Commission is on the discounted price. */
export async function weeklyEarnings(weekStart: Date, professionalId?: string) {
  const { rows } = await pool.query(
    `select p.id, p.name, count(*)::int visits, round(sum((b.subtotal_paise - b.discount_paise)::numeric / b.sessions))::bigint gross_paise,
       bool_or(po.id is not null) paid
     from visits v join bookings b on b.id = v.booking_id join professionals p on p.id = v.professional_id
     left join payouts po on po.professional_id = p.id and po.week_start = $1::date
     join visit_events e on e.visit_id = v.id and e.status = 'completed'
     where v.status = 'completed' and e.created_at >= $2 and e.created_at < $3 and ($4::text is null or p.id = $4)
     group by p.id, p.name order by gross_paise desc`,
    [new Date(weekStart.getTime() + 19_800_000).toISOString().slice(0, 10), weekStart, new Date(weekStart.getTime() + 7 * DAY_MS), professionalId ?? null],
  );
  return rows.map((r) => {
    const gross = Number(r.gross_paise) / 100;
    return { id: r.id as string, name: r.name as string, visits: r.visits as number, gross, net: Math.round(gross * (1 - COMMISSION_RATE)), paid: Boolean(r.paid) };
  });
}

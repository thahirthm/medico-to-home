import { CALL_GRACE_MIN, CALL_OPENS_MIN, callIsOpen } from "@medico/shared";
import agora from "agora-token";
import type { FastifyInstance } from "fastify";
import { requireUser } from "../auth";
import { pool } from "../db";
import { env } from "../env";
import { ApiError } from "../errors";
import { formatIst } from "../time";

// agora-token is CommonJS, so its builders come off the default export.
const { RtcRole, RtcTokenBuilder } = agora;

// Fixed ids in each booking's room, so each side always knows which video is the other person's.
const UID = { patient: 1, pro: 2 } as const;

export async function callRoutes(app: FastifyInstance) {
  // A token to join one online consultation's video room. Only the patient's account and the Medico can get one,
  // and only from shortly before the slot until an hour after it ends.
  app.post<{ Params: { id: string } }>("/calls/:id/token", { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } }, async (request) => {
    const user = await requireUser(request);
    const { rows } = await pool.query(
      `select b.id, b.owner_id, b.status, b.mode, b.patient_name, b.service_name, p.name pro_name, p.profile_id, p.photo_url, c.one role
       from bookings b join professionals p on p.id = b.professional_id join categories c on c.key = p.category_key where b.id = $1`,
      [request.params.id],
    );
    const b = rows[0];
    const side = b?.owner_id === user.id ? "patient" : b?.profile_id === user.id ? "pro" : null;
    if (!b || !side) throw new ApiError(404, "Consultation not found.");
    if (b.mode !== "online") throw new ApiError(400, "This booking is a home visit, not an online consultation.");
    if (b.status === "cancelled") throw new ApiError(409, "This consultation was cancelled.");

    const visit = (await pool.query(
      "select id, starts_at, ends_at, status from visits where booking_id = $1 and status not in ('cancelled', 'skipped', 'no_show', 'completed') order by starts_at limit 1",
      [b.id],
    )).rows[0];
    if (!visit) throw new ApiError(409, "This consultation has ended.");
    const starts = new Date(visit.starts_at), ends = new Date(visit.ends_at);
    const when = formatIst(starts, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
    if (!callIsOpen(starts, ends)) {
      if (Date.now() < starts.getTime()) {
        const opens = formatIst(new Date(starts.getTime() - CALL_OPENS_MIN * 60_000), { hour: "numeric", minute: "2-digit", hour12: true });
        throw new ApiError(409, `Your consultation is on ${when}. The call opens at ${opens}, ${CALL_OPENS_MIN} minutes before.`);
      }
      throw new ApiError(409, "This consultation's time has passed.");
    }
    if (!env.AGORA_APP_ID || !env.AGORA_APP_CERTIFICATE) throw new ApiError(503, "Video calls are not available right now. Please try again shortly.");

    // Valid until the call closes, and for at least 10 minutes.
    const seconds = Math.max(600, Math.round((ends.getTime() + CALL_GRACE_MIN * 60_000 - Date.now()) / 1000));
    const uid = UID[side];
    const token = RtcTokenBuilder.buildTokenWithUid(env.AGORA_APP_ID, env.AGORA_APP_CERTIFICATE, b.id, uid, RtcRole.PUBLISHER, seconds, seconds);
    // The builder returns an empty token when the App ID or certificate is not a 32-character hex code.
    if (!token) {
      request.log.error("Agora token is empty: check AGORA_APP_ID and AGORA_APP_CERTIFICATE (32 hex characters each, no quotes or spaces)");
      throw new ApiError(503, "Video calls are not set up correctly yet. Please try again later.");
    }
    return {
      appId: env.AGORA_APP_ID, channel: b.id, uid, token, peerUid: side === "pro" ? UID.patient : UID.pro,
      side, visitId: visit.id, service: b.service_name, when,
      peer: side === "pro" ? { name: b.patient_name, role: "Patient", photo: "" } : { name: b.pro_name, role: b.role, photo: b.photo_url },
    };
  });
}

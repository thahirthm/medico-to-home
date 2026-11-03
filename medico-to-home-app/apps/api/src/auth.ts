import type { FastifyRequest } from "fastify";
import { pool } from "./db";
import { env } from "./env";
import { ApiError } from "./errors";

export interface User {
  id: string;
  email: string;
  role: "patient" | "professional" | "admin";
  staff_roles: string[];
  terms_accepted_at: string | null;
  /** "aal2" once the 2-step code has been entered in this session. */
  aal: string;
}

export const STAFF_ROLES = ["super_admin", "operations", "verification", "finance", "support", "sos_dispatcher", "content"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

// Admin modules and the staff roles that may open them. Super admins open everything.
export const MODULES = {
  overview: [...STAFF_ROLES],
  applications: ["verification"],
  professionals: ["verification", "operations"],
  users: ["support", "operations"],
  bookings: ["operations", "support"],
  payouts: ["finance"],
  content: ["content"],
  staff: [],
  audit: [],
} satisfies Record<string, readonly StaffRole[]>;
export type Module = keyof typeof MODULES;

export const canOpen = (roles: string[], module: Module) =>
  roles.includes("super_admin") || (MODULES[module] as readonly string[]).some((r) => roles.includes(r));

const CACHE_MS = 60_000;
const cache = new Map<string, { id: string; email: string; aal: string; until: number }>();

// The token has just been checked by Supabase, so its claims can be read as they are.
const claims = (token: string) => {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString()) as { aal?: string };
  } catch {
    return {};
  }
};

async function verifyToken(token: string) {
  const hit = cache.get(token);
  if (hit && hit.until > Date.now()) return hit;
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new ApiError(401, "Please log in again.");
  const user = (await res.json()) as { id: string; email?: string };
  const entry = { id: user.id, email: user.email ?? "", aal: claims(token).aal ?? "aal1", until: Date.now() + CACHE_MS };
  cache.set(token, entry);
  return entry;
}

/** Verifies the Supabase token and creates the profile on first use. */
export async function requireUser(request: FastifyRequest): Promise<User> {
  const token = request.headers.authorization?.replace(/^Bearer /, "");
  if (!token) throw new ApiError(401, "Please log in.");
  const { id, email, aal } = await verifyToken(token);
  const { rows } = await pool.query(
    `insert into profiles (id, email) values ($1, $2)
     on conflict (id) do update set email = excluded.email
     returning id, email, role, staff_roles, terms_accepted_at`,
    [id, email],
  );
  const user = { ...rows[0], aal } as User;
  request.actor = user.id;
  return user;
}

/** Signed in and finished the new-account step (name, mobile, city, terms). */
export async function requireMember(request: FastifyRequest): Promise<User> {
  const user = await requireUser(request);
  if (!user.terms_accepted_at) throw new ApiError(403, "Please finish setting up your account first.");
  return user;
}

/** Staff only, after the 2-step code, and only for modules their roles allow. */
export async function requireStaff(request: FastifyRequest, module: Module): Promise<User> {
  const user = await requireUser(request);
  if (user.role !== "admin") throw new ApiError(403, "You do not have access to this page.");
  if (user.aal !== "aal2") throw new ApiError(403, "Please enter your 2-step code.");
  if (!canOpen(user.staff_roles, module)) throw new ApiError(403, "Your staff role does not include this section.");
  return user;
}

export const audit = (actor: string, action: string, subject: string) =>
  pool.query("insert into audit_log (actor, action, subject) values ($1, $2, $3)", [actor, action, subject]);

declare module "fastify" {
  interface FastifyRequest {
    actor?: string;
  }
}

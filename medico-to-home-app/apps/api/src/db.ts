import pg from "pg";
import { env } from "./env";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 5,
  // Encrypted, but the server certificate is not verified yet.
  // Pin Supabase's CA certificate before storing real data.
  ssl: { rejectUnauthorized: false },
});

import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
  API_PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  // The admin dashboard's own address in production (e.g. admin.medicotohome.in); links in staff emails use it.
  ADMIN_HOST: z.string().optional(),
  // Optional: writes Medico bios with Claude. Without it a template writes them.
  ANTHROPIC_API_KEY: z.string().optional(),
  // Admin 2-step code. Only turn "off" for local testing; production keeps it "on".
  ADMIN_TWO_STEP: z.enum(["on", "off"]).default("on"),
  // Email over SMTP (Gmail app password, Brevo, Zoho, Resend, SES…). Without SMTP_HOST, emails are written to the log instead.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default("Medico To Home <no-reply@medicotohome.com>"),
  // Online video consultations (Agora). Without both, booking still works but calls cannot start.
  AGORA_APP_ID: z.string().trim().optional(),
  AGORA_APP_CERTIFICATE: z.string().trim().optional(),
  // Who hears about new bookings, accounts and registrations. Comma-separated.
  ADMIN_NOTIFY_EMAIL: z.string().default(""),
});

export const env = schema.parse(process.env);

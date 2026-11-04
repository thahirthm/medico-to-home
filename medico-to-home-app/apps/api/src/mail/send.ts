import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../env";
import type { Email } from "./templates";

// One SMTP connection for the whole API, made on first use. Without SMTP_HOST nothing is sent; the email is logged instead.
let transport: Transporter | null = null;
const smtp = () =>
  (transport ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    // Gmail shows app passwords in groups of four ("abcd efgh ijkl mnop"); the spaces are not part of it.
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS?.replace(/\s+/g, "") } : undefined,
  }));

export const adminEmails = () => env.ADMIN_NOTIFY_EMAIL.split(",").map((e) => e.trim()).filter(Boolean);

/**
 * Sends in the background: a mail problem is logged, never passed on, so a booking or sign-up never fails
 * because an email could not go out.
 */
export function sendMail(to: string | string[] | null | undefined, email: Email) {
  const list = [to ?? []].flat().map((e) => e.trim()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  if (!list.length) return;
  if (!env.SMTP_HOST) {
    console.info(`[mail] not sent (SMTP_HOST is not set) · to ${list.join(", ")} · ${email.subject}`);
    return;
  }
  // Each person gets their own copy, so nobody sees the other addresses.
  for (const address of list) {
    smtp()
      .sendMail({ from: env.MAIL_FROM, to: address, subject: email.subject, html: email.html, text: email.text })
      .catch((error: Error) => console.error(`[mail] failed · to ${address} · ${email.subject} · ${error.message}`));
  }
}

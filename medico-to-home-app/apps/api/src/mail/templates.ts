import { env } from "../env";

// Every email shares one layout: a navy header with the logo (a PNG served by the website, since mail apps do not show SVG), a white card, an optional button and a short footer.
// Tables and inline styles only, so it reads the same in Gmail, Outlook and phone mail apps. Each has a plain-text twin.

export interface Email {
  subject: string;
  html: string;
  text: string;
}

export const siteUrl = () => (env.WEB_ORIGIN.split(",")[0] ?? "").trim().replace(/\/$/, "");
export const adminUrl = () => (env.ADMIN_HOST ? `https://${env.ADMIN_HOST}/admin` : `${siteUrl()}/admin`);

const NAVY = "#02084D";
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const first = (name: string) => (name.trim().startsWith("Dr.") ? name.trim().split(" ").slice(0, 2).join(" ") : name.trim().split(" ")[0]) || "there";

type Rows = [string, string][];
interface Parts {
  preview: string;
  title: string;
  intro: string[];
  rows?: Rows;
  note?: { tone: "good" | "warn" | "bad"; text: string };
  button?: { label: string; url: string };
  outro?: string[];
}

const TONE = { good: ["#E8F5EF", "#1F7A55"], warn: ["#FBF6EA", "#8A5A0A"], bad: ["#FDECEC", "#C22F2F"] } as const;

function layout(subject: string, m: Parts): Email {
  const para = (t: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#3A3F5C">${esc(t)}</p>`;
  const rows = m.rows?.filter(([, v]) => v).length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 20px;border:1px solid #E6E8EF;border-radius:12px;border-collapse:separate;overflow:hidden">
        ${m.rows.filter(([, v]) => v).map(([k, v], i) => `<tr>
          <td style="padding:11px 16px;font-size:13px;color:#6B7085;width:38%;vertical-align:top;${i ? "border-top:1px solid #EEF0F5;" : ""}">${esc(k)}</td>
          <td style="padding:11px 16px;font-size:14px;color:${NAVY};font-weight:500;vertical-align:top;${i ? "border-top:1px solid #EEF0F5;" : ""}">${esc(v)}</td>
        </tr>`).join("")}
      </table>`
    : "";
  const note = m.note
    ? `<div style="margin:4px 0 20px;padding:14px 16px;border-radius:12px;background:${TONE[m.note.tone][0]};color:${TONE[m.note.tone][1]};font-size:14px;line-height:1.55">${esc(m.note.text)}</div>`
    : "";
  const button = m.button
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 22px"><tr><td style="border-radius:999px;background:${NAVY}">
        <a href="${esc(m.button.url)}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px">${esc(m.button.label)}</a>
      </td></tr></table>`
    : "";

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#F5F6FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Helvetica,Arial,sans-serif;color:${NAVY}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(m.preview)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F6FA;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px">
        <tr><td style="background:${NAVY};border-radius:20px 20px 0 0;padding:26px 32px">
          <img src="${esc(siteUrl())}/brand/email-logo-white.png" width="150" height="49" alt="Medico To Home" style="display:block;width:150px;height:auto;border:0;outline:none;color:#ffffff;font-size:20px;font-weight:700" />
          <div style="margin-top:12px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.6)">Trusted care at your doorstep</div>
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:0 0 20px 20px;padding:32px;border:1px solid #E6E8EF;border-top:0">
          <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;font-weight:600;letter-spacing:-.02em;color:${NAVY}">${esc(m.title)}</h1>
          ${m.intro.map(para).join("")}
          ${note}${rows}${button}
          ${(m.outro ?? []).map(para).join("")}
          <p style="margin:18px 0 0;font-size:15px;line-height:1.6;color:#3A3F5C">Warm regards,<br><strong style="color:${NAVY}">The Medico To Home team</strong></p>
        </td></tr>
        <tr><td style="padding:20px 32px;text-align:center;font-size:12px;line-height:1.6;color:#9A9EB3">
          In an emergency, call 112 straight away.<br>
          Medico To Home · Kozhikode, Kerala · <a href="${esc(siteUrl())}" style="color:#6B7085">${esc(siteUrl().replace(/^https?:\/\//, ""))}</a><br>
          You are receiving this because of your Medico To Home account.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    m.title, "",
    ...m.intro.flatMap((t) => [t, ""]),
    ...(m.note ? [m.note.text, ""] : []),
    ...(m.rows?.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`) ?? []),
    ...(m.rows?.length ? [""] : []),
    ...(m.button ? [`${m.button.label}: ${m.button.url}`, ""] : []),
    ...(m.outro ?? []).flatMap((t) => [t, ""]),
    "Warm regards,", "The Medico To Home team", "", "In an emergency, call 112 straight away.",
  ].join("\n");
  return { subject, html, text };
}

// ── Bookings ─────────────────────────────────────────────────────────────

export interface BookingMail {
  id: string;
  patient: string;
  bookedBy: string;
  bookedByEmail: string;
  bookedByPhone: string;
  professional: string;
  role: string;
  service: string;
  sessions: number;
  plan: boolean;
  firstVisit: string;
  address: string;
  total: string;
  payment: string;
  notes: string;
}

const bookingRows = (b: BookingMail, who: "patient" | "pro" | "admin"): Rows => [
  ["Booking", b.id],
  ["Service", b.plan ? `${b.service} · ${b.sessions} sessions` : b.service],
  ...(who !== "pro" ? ([["Medico", `${b.professional} · ${b.role}`]] as Rows) : []),
  ["Patient", b.patient],
  [b.plan ? "First visit" : "Visit", b.firstVisit],
  ["Address", b.address],
  ...(who === "admin" ? ([["Booked by", [b.bookedBy, b.bookedByPhone && `+91 ${b.bookedByPhone}`, b.bookedByEmail].filter(Boolean).join(" · ")]] as Rows) : []),
  ...(who !== "patient" && b.notes ? ([["Notes", b.notes]] as Rows) : []),
  [who === "pro" ? "Visit fee (total)" : "Total", b.total],
  ["Payment", b.payment],
];

export const bookingForPatient = (b: BookingMail) =>
  layout(`Booking confirmed · ${b.id}`, {
    preview: `${b.professional} will visit on ${b.firstVisit}.`,
    title: "Your booking is confirmed",
    intro: [`Hi ${first(b.bookedBy)},`, `Thank you for booking with Medico To Home. ${b.professional} will visit ${b.patient === b.bookedBy ? "you" : b.patient} at home. Here are the details:`],
    rows: bookingRows(b, "patient"),
    button: { label: "Track your booking", url: `${siteUrl()}/bookings/${b.id}` },
    outro: ["You can cancel free of charge up to 4 hours before the visit from your booking page. If anything changes, reply to this email and we will help."],
  });

export const bookingForProfessional = (b: BookingMail) =>
  layout(`New booking · ${b.firstVisit}`, {
    preview: `${b.patient} · ${b.service} · ${b.firstVisit}`,
    title: "You have a new booking",
    intro: [`Hi ${first(b.professional)},`, `A family has booked you for a home visit. Please open your dashboard to accept it.`],
    rows: bookingRows(b, "pro"),
    button: { label: "Open my dashboard", url: `${siteUrl()}/pro` },
    outro: ["Please reach a few minutes early and update the visit status from your dashboard as you go."],
  });

export const bookingForAdmin = (b: BookingMail) =>
  layout(`New booking ${b.id} · ${b.professional}`, {
    preview: `${b.bookedBy} booked ${b.professional} for ${b.firstVisit}.`,
    title: "New booking received",
    intro: [`${b.bookedBy} has booked ${b.professional} (${b.role}).`],
    rows: bookingRows(b, "admin"),
    button: { label: "Open bookings", url: `${adminUrl()}/bookings` },
  });

// ── Accounts ─────────────────────────────────────────────────────────────

export const welcomePatient = (name: string) =>
  layout("Welcome to Medico To Home", {
    preview: "Your account is ready. Book doctors, nurses and carers at home.",
    title: `Welcome, ${first(name)}!`,
    intro: [
      "Your Medico To Home account is ready. From today, verified doctors, nurses, physiotherapists and carers can come to your home in Kozhikode and Malappuram.",
      "Here is what you can do next:",
    ],
    rows: [
      ["Book a visit", "Choose a medico, a time and pay after the first visit"],
      ["Health cards", "Keep allergies, conditions and medicines ready for every visit"],
      ["Your family", "Add parents, spouse or children and book care for them too"],
    ],
    button: { label: "Find care near you", url: siteUrl() },
    outro: ["Every medico on Medico To Home is checked with their council, their ID and the police before they can visit you."],
  });

export const medicoReceived = (name: string) =>
  layout("We have received your Medico registration", {
    preview: "Thank you for joining. Here is what happens next.",
    title: `Thank you, ${first(name)}`,
    intro: ["We have received your Medico registration. Kerala has one more life-saver on call.", "Our team now checks your registration in four short steps. We will email you as each one is done."],
    rows: [
      ["1. Documents", "Your photo, qualification and ID"],
      ["2. Council registration", "Confirmed with your council (24–48 hours)"],
      ["3. ID and police clearance", "A standard check for home visits"],
      ["4. Short interview", "A 15-minute call with our care team"],
    ],
    button: { label: "Open my dashboard", url: `${siteUrl()}/pro` },
  });

export interface NewAccountMail {
  kind: "patient" | "medico";
  name: string;
  email: string;
  phone: string;
  place: string;
  role?: string;
  id: string;
}

export const newAccountForAdmin = (a: NewAccountMail) =>
  layout(a.kind === "medico" ? `New Medico registration · ${a.name}` : `New patient account · ${a.name}`, {
    preview: a.kind === "medico" ? `${a.name} (${a.role || "Medico"}) is waiting for verification.` : `${a.name} from ${a.place || "—"} created an account.`,
    title: a.kind === "medico" ? "New Medico registration" : "New patient account",
    intro: [a.kind === "medico" ? "A new Medico has sent their registration and is waiting for verification." : "A new patient has created an account."],
    rows: [["Name", a.name], ...(a.role ? ([["Role", a.role]] as Rows) : []), ["Email", a.email], ["Mobile", a.phone && `+91 ${a.phone}`], [a.kind === "medico" ? "District" : "City", a.place]],
    button: a.kind === "medico" ? { label: "Review the registration", url: `${adminUrl()}/applications` } : { label: "Open the account", url: `${adminUrl()}/users/${a.id}` },
  });

// ── Medico verification ──────────────────────────────────────────────────

export const medicoStepPassed = (name: string, step: string, next: string) =>
  layout(`Verification update · ${step} done`, {
    preview: `${step} is done. Next: ${next}.`,
    title: `${step}: done ✓`,
    intro: [`Hi ${first(name)},`, `Good news: your ${step.toLowerCase()} step is complete. Next we move on to ${next.toLowerCase()}.`],
    button: { label: "See your progress", url: `${siteUrl()}/pro` },
  });

export const medicoApproved = (name: string) =>
  layout("You are approved as a Medico 🎉", {
    preview: "Welcome to Medico To Home. Your profile goes live very soon.",
    title: `Congratulations, ${first(name)}!`,
    intro: ["Your Medico registration is approved. You are now a Verified Medico with Medico To Home.", "Our team is doing a last check of your profile and will make it live shortly. We will email you the moment families can book you."],
    note: { tone: "good", text: "Verified Medico · Approved" },
    button: { label: "Open my dashboard", url: `${siteUrl()}/pro` },
  });

export const medicoLive = (name: string) =>
  layout("Your profile is live", {
    preview: "Families can now find and book you.",
    title: "You are live! 🚀",
    intro: [`Hi ${first(name)},`, "Your profile is now live on Medico To Home. Families near you can find and book you.", "Switch yourself online from your dashboard whenever you are free to take visits."],
    button: { label: "Go online", url: `${siteUrl()}/pro` },
  });

export const medicoInfoNeeded = (name: string, note: string) =>
  layout("We need a few more details", {
    preview: note,
    title: "A few more details, please",
    intro: [`Hi ${first(name)},`, "We are checking your Medico registration and need a little more from you:"],
    note: { tone: "warn", text: note },
    button: { label: "Update my registration", url: `${siteUrl()}/medico/register?edit` },
    outro: ["Once you send the update, we pick up right where we left off."],
  });

export const medicoRejected = (name: string, note: string) =>
  layout("About your Medico registration", {
    preview: "An update on your registration.",
    title: "An update on your registration",
    intro: [`Hi ${first(name)},`, "Thank you for your interest in joining Medico To Home. After reviewing your registration, we are not able to approve it at this time."],
    note: { tone: "bad", text: note },
    outro: ["If you think this is a mistake, or your situation changes, you are welcome to apply again from the Medico page."],
  });

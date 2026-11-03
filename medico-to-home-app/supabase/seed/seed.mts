// Loads the demo catalogue and creates the admin and demo professional logins.
// Development only. Run with: npm run db:seed
import { randomBytes } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";
import pg from "pg";

const data = JSON.parse(readFileSync(new URL("./demo-data.json", import.meta.url), "utf8"));
const db = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await db.connect();

const faqs = [
  ["Are your professionals verified?", "Yes. Every professional’s council registration, identity and police clearance is checked, followed by an in-person interview before their first visit."],
  ["How quickly can someone visit?", "Most nurses, doctors and lab technicians can visit the same day in Kozhikode city. Look for the green “Available today” label."],
  ["What if I need to cancel or reschedule?", "Cancel free up to 4 hours before a visit. In a treatment plan you can skip or move any session from the booking calendar."],
  ["How do treatment plans work?", "Choose the number of sessions, start date and frequency. All dates are scheduled automatically, with 10% off from 10 sessions and 15% off from 20."],
  ["Which areas do you cover?", "All of Kozhikode and Malappuram districts — from Beypore and Feroke to Manjeri, Tirur, Perinthalmanna and Nilambur."],
];

async function account(email: string, phone: string, name: string, role: string, envKey: string) {
  const found = await db.query("select id from auth.users where email = $1", [email]);
  let id: string = found.rows[0]?.id;
  if (!id) {
    const password = randomBytes(12).toString("hex");
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: { apikey: process.env.SUPABASE_SECRET_KEY!, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, email_confirm: true }),
    });
    if (!res.ok) throw new Error(`Could not create ${role}: ${res.status} ${await res.text()}`);
    id = (await res.json()).id;
    appendFileSync(new URL("../../.env.local", import.meta.url), `${envKey}=${password}\n`);
  }
  await db.query(
    `insert into profiles (id, full_name, phone, email, role, staff_roles, terms_accepted_at) values ($1, $2, $3, $4, $5, $6, now())
     on conflict (id) do update set role = excluded.role, staff_roles = excluded.staff_roles`,
    [id, name, phone, email, role, role === "admin" ? ["super_admin"] : []],
  );
  return id;
}

await db.query("begin");
const cats = Object.entries<any>(data.CATS);
for (const [i, [key, c]] of cats.entries()) {
  await db.query(
    `insert into categories (key, label, one, plural, brand, unit, plan_default, allow_plan, mode, registration_label, sort_order)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict (key) do nothing`,
    [key, c.label, c.one, c.plural, c.brand, c.unit, c.plan, c.allowPlan, c.mode, c.reg, i],
  );
  const has = await db.query("select 1 from service_templates where category_key = $1 limit 1", [key]);
  if (!has.rowCount) {
    for (const [j, s] of c.svcs.entries()) {
      await db.query("insert into service_templates (category_key, name, multiplier, duration, sort_order) values ($1,$2,$3,$4,$5)", [key, s[0], s[1], s[2], j]);
    }
  }
}
for (const [name, l] of Object.entries<any>(data.LOCS)) {
  await db.query(
    `insert into localities (name, district, pincode, location)
     values ($1,$2,$3, extensions.st_setsrid(extensions.st_makepoint($5,$4),4326)::extensions.geography) on conflict (name) do nothing`,
    [name, l[2], l[3], l[0], l[1]],
  );
}
for (const [i, t] of data.THER.entries()) {
  await db.query(
    `insert into therapies (id, label, category_key, brand, helps, steps, plan, sort_order) values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict (id) do nothing`,
    [t.id, t.label, t.cat, t.brand, t.helps, t.steps, t.plan, i],
  );
}
if (!(await db.query("select 1 from faqs limit 1")).rowCount) {
  for (const [i, [q, a]] of faqs.entries()) await db.query("insert into faqs (question, answer, sort_order) values ($1,$2,$3)", [q, a, i]);
}
for (const p of data.pros) {
  const done = await db.query(
    `insert into professionals (id, name, gender, category_key, qualification, experience_years, rating, review_count, locality_id,
       languages, base_price, radius_km, bio, photo_url, registration_no, available_today_from, status, is_demo)
     select $1,$2,$3,$4,$5,$6,$7,$8,l.id,$9,$10,$11,$12,$13,$14,$15,'live',true from localities l where l.name = $16
     on conflict (id) do nothing returning id`,
    [p.id, p.name, p.g, p.cat, p.qual, p.exp, p.rating, p.reviews, p.langs, p.price, p.radius, p.bio, p.img ?? "", `DEMO-${p.id}`, p.today ?? "", p.locality],
  );
  if (done.rowCount) {
    for (const r of p.revs) {
      await db.query("insert into reviews (professional_id, author_name, place, stars, body, is_demo) values ($1,$2,$3,$4,$5,true)", [p.id, r.name, r.place, r.stars, r.text]);
    }
  }
}
await db.query("commit");

await account("admin@medicotohome.in", "9000000001", "Admin", "admin", "ADMIN_PASSWORD");
const proId = await account("shahid.demo@medicotohome.in", "9000000002", "Shahid Ponnath", "professional", "PRO_DEMO_PASSWORD");
await db.query("update professionals set profile_id = $1 where id = 'p12'", [proId]);

const counts = await db.query("select (select count(*) from professionals) pros, (select count(*) from localities) locs, (select count(*) from service_templates) svcs, (select count(*) from reviews) revs, (select count(*) from profiles) users");
console.log(counts.rows[0]);
await db.end();

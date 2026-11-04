"use client";

import { useState, type FormEvent } from "react";
import { api, type Me } from "@/lib/api";
import { useSite } from "@/components/site/SiteProvider";
import { Chip, CONDITIONS, GENDERS, HealthFields, input, label, Section, splitList } from "./formParts";
import { MedicoCard } from "./MedicoCard";

const CITIES = ["Kozhikode", "Malappuram", "Other"];
const LANGUAGES = ["Malayalam", "English", "Hindi", "Tamil", "Arabic"];
interface Patient { rel: string; gender?: string; blood?: string; h?: string; w?: string; conds?: { n: string }[]; alg?: string[]; meds?: { n: string }[] }
interface Address { house?: string; street?: string; landmark?: string; locality?: string; pincode?: string }
const RELATIONS = ["Spouse", "Parent", "Son", "Daughter", "Sibling", "Friend", "Other"];
// The emergency contact is kept as one line: "Name (Relation) · 9876543210".
const EMERGENCY = /^(.*?)(?: \((.*)\))?(?: · (\d*))?$/;
const digits = (s = "", n = 10) => s.replace(/\D/g, "").slice(-n);
const emergencyLine = (name = "", rel = "", phone = "") => {
  const n = name.trim(), p = digits(phone);
  return n || p ? `${n || "Contact"}${rel ? ` (${rel})` : ""}${p ? ` · ${p}` : ""}` : "";
};

/** Patient registration, shown once after a new account's first sign-in. Only the basics are required. */
export function PatientRegistration() {
  const v = useSite();
  if (!v.authReady || !v.me) return <p className="py-24 text-center text-sm text-muted">Loading…</p>;
  return <RegistrationForm v={v} me={v.me} />;
}

// Starts from whatever the account already has, so a returning user edits rather than retypes.
function initialFields(me: Me, patients: Patient[], addresses: Address[]) {
  const self = patients.find((p) => p.rel === "Me");
  const home = addresses[0];
  const [, eName = "", eRel = "", ePhone = ""] = (me.emergency_contact || "").match(EMERGENCY) || [];
  const condNames = (self?.conds || []).map((c) => c.n);
  return {
    conds: condNames.filter((n) => CONDITIONS.includes(n)),
    f: {
      name: me.full_name || "", phone: me.phone || "", city: me.city || "", dob: /^\d{4}-\d{2}-\d{2}$/.test(me.dob || "") ? me.dob : "",
      gender: self?.gender || "", language: me.preferred_language || "", eName, eRel, ePhone,
      house: home?.house || "", street: home?.street || "", landmark: home?.landmark || "", locality: home?.locality || "", pincode: home?.pincode || "",
      blood: self?.blood || "", h: self?.h || "", w: self?.w || "",
      otherConds: condNames.filter((n) => !CONDITIONS.includes(n)).join(", "),
      alg: (self?.alg || []).join(", "), meds: (self?.meds || []).map((m) => m.n).join(", "),
    } as Record<string, string>,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RegistrationForm({ v, me }: { v: any; me: Me }) {
  const [init] = useState(() => initialFields(me, v.patients || [], v.addresses || []));
  const [f, setF] = useState(init.f);
  const [conds, setConds] = useState<string[]>(init.conds);
  const [accept, setAccept] = useState(!me.needs_setup);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));
  const pick = (k: string, value: string) => setF((x) => ({ ...x, [k]: x[k] === value ? "" : value }));
  const allConds = [...conds, ...splitList(f.otherConds || "")];
  const emergency = emergencyLine(f.eName, f.eRel, f.ePhone);
  const card = {
    id: me.id, email: me.email, name: f.name || "", phone: digits(f.phone), city: f.city || "", dob: f.dob || "", gender: f.gender || "", language: f.language || "",
    blood: f.blood || "", h: f.h || "", w: f.w || "", emergency, conds: allConds, alg: splitList(f.alg || ""), meds: splitList(f.meds || ""),
    address: [f.house, f.street, f.landmark, f.locality, f.pincode].map((x) => x?.trim()).filter(Boolean).join(", "),
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await api("/me/setup", {
        body: {
          full_name: f.name, phone: digits(f.phone), city: f.city, accept_terms: accept,
          gender: f.gender, dob: f.dob, language: f.language, emergency_contact: emergency,
          address: { house: f.house, street: f.street, landmark: f.landmark, locality: f.locality, pincode: digits(f.pincode, 6) },
          health: { blood: f.blood, h: f.h, w: f.w, conds: allConds, alg: card.alg, meds: card.meds },
        },
      });
      await v.setupDone();
    } catch (err) {
      setError((err as Error).message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setBusy(false);
    }
  };

  return (
    <div className="bg-wash">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-24 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-10">
        <div className="flex flex-col gap-2 lg:col-span-2">
          <h1 className="text-[clamp(30px,4vw,44px)] font-light leading-tight tracking-tight">
            Set up your <span className="font-semibold">account</span>
          </h1>
          <p className="text-[15px] text-body">
            Only the basics are required. The rest helps your medico prepare before the visit, and you can add it later from My profile.
          </p>
        </div>
        <aside className="w-full max-w-[440px] justify-self-center lg:sticky lg:top-24 lg:order-2 lg:max-w-none">
          <MedicoCard d={card} />
        </aside>
        <form onSubmit={submit} className="flex min-w-0 flex-col gap-5 lg:order-1">
          {error && <p role="alert" className="rounded-xl bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}

          <Section title="Basic details" hint="So we can reach you and send care to the right place.">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={`${label} sm:col-span-2`}>Full name *
                <input className={input} required autoFocus autoComplete="name" value={f.name || ""} onChange={set("name")} placeholder="As on your ID" />
              </label>
              <label className={`${label} sm:col-span-2`}>Email ID
                <input className={`${input} cursor-default bg-wash text-muted`} type="email" readOnly value={me.email} aria-describedby="email-note" />
                <span id="email-note" className="text-xs text-muted">Your login email. It cannot be changed here.</span>
              </label>
              <label className={label}>Mobile number *
                <input className={input} required inputMode="tel" autoComplete="tel-national" value={f.phone || ""} onChange={set("phone")} placeholder="10-digit mobile number" />
              </label>
              <label className={label}>City *
                <select className={input} required value={f.city || ""} onChange={set("city")}>
                  <option value="" disabled>Choose your city</option>
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>
          </Section>

          <Section optional title="About you" hint="Helps us match you with the right medico.">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>Date of birth
                <input className={input} type="date" max={new Date().toISOString().slice(0, 10)} value={f.dob || ""} onChange={set("dob")} />
              </label>
              <label className={label}>Preferred language
                <select className={input} value={f.language || ""} onChange={set("language")}>
                  <option value="">Any</option>
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </label>
            </div>
            <div className="flex flex-col gap-2 text-[13px] text-body">Gender
              <div className="flex flex-wrap gap-2">{GENDERS.map((g) => <Chip key={g} on={f.gender === g} onClick={() => pick("gender", g)}>{g}</Chip>)}</div>
            </div>
          </Section>

          <Section optional title="Home address" hint="Where visits usually happen. Saves time when you book.">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>House / flat
                <input className={input} autoComplete="address-line1" value={f.house || ""} onChange={set("house")} placeholder="House name or number" />
              </label>
              <label className={label}>Street / area
                <input className={input} autoComplete="address-line2" value={f.street || ""} onChange={set("street")} />
              </label>
              <label className={label}>Landmark
                <input className={input} value={f.landmark || ""} onChange={set("landmark")} placeholder="Near…" />
              </label>
              <label className={label}>Area
                <select className={input} value={f.locality || ""} onChange={set("locality")}>
                  <option value="">Choose your area</option>
                  {/* An area typed in before this list existed stays selectable until it is changed. */}
                  {f.locality && !(v.areas || []).includes(f.locality) && <option value={f.locality}>{f.locality}</option>}
                  {(v.areas || []).map((a: string) => <option key={a}>{a}</option>)}
                </select>
              </label>
              <label className={label}>Pincode
                <input className={input} inputMode="numeric" autoComplete="postal-code" maxLength={6} value={f.pincode || ""} onChange={set("pincode")} placeholder="6 digits" />
              </label>
            </div>
          </Section>

          <Section optional title="Emergency contact" hint="Someone we can call if we cannot reach you during a visit.">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className={label}>Name
                <input className={input} value={f.eName || ""} onChange={set("eName")} />
              </label>
              <label className={label}>Relationship
                <select className={input} value={f.eRel || ""} onChange={set("eRel")}>
                  <option value="">Choose</option>
                  {RELATIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </label>
              <label className={label}>Mobile number
                <input className={input} inputMode="tel" value={f.ePhone || ""} onChange={set("ePhone")} placeholder="10 digits" />
              </label>
            </div>
          </Section>

          <HealthFields f={f} set={set} conds={conds} setConds={setConds} hint="Shared only with the medico you book, and only if you allow it." />

          <label className="flex cursor-pointer items-start gap-3 px-1 text-sm leading-relaxed text-body">
            <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-1 size-4 flex-none accent-navy" />
            <span>
              I accept the{" "}
              <a href="/legal/terms" target="_blank" className="text-navy underline">Terms</a> and{" "}
              <a href="/legal/privacy" target="_blank" className="text-navy underline">Privacy policy</a>. *
            </span>
          </label>
          <button disabled={busy || !accept} className="w-full cursor-pointer rounded-full bg-navy px-4 py-3.5 text-[15px] font-semibold text-white hover:bg-navy-soft disabled:cursor-default disabled:opacity-50 sm:w-auto sm:self-end sm:px-10">
            {busy ? "Saving…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

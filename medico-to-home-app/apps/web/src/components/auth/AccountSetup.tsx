"use client";

import { useState, type FormEvent } from "react";
import { api, type Me } from "@/lib/api";

const input = "w-full rounded-xl border border-line bg-white px-4 py-3 text-base font-light text-navy outline-none focus:border-navy";
const CITIES = ["Kozhikode", "Malappuram", "Other"];

/** Asked once, right after a new account's first sign-in. */
export function AccountSetup({ me, onDone }: { me: Me; onDone: () => void }) {
  const [name, setName] = useState(me.full_name);
  const [phone, setPhone] = useState(me.phone ?? "");
  const [city, setCity] = useState(me.city || "");
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await api("/me/setup", { body: { full_name: name, phone: phone.replace(/\D/g, "").slice(-10), city, accept_terms: accept } });
      onDone();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3.5">
      <h2 className="text-[28px] font-light tracking-tight">
        Set up your <span className="font-semibold">account</span>
      </h2>
      <p className="text-sm text-muted">{me.email}</p>
      <input className={input} required autoFocus autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" aria-label="Full name" />
      <input className={input} required inputMode="tel" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" aria-label="Mobile number" />
      <select className={input} required value={city} onChange={(e) => setCity(e.target.value)} aria-label="City">
        <option value="" disabled>Choose your city</option>
        {CITIES.map((c) => <option key={c}>{c}</option>)}
      </select>
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-body">
        <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-1 size-4 flex-none accent-navy" />
        <span>
          I accept the{" "}
          <a href="/legal/terms" target="_blank" className="text-navy underline">Terms</a> and{" "}
          <a href="/legal/privacy" target="_blank" className="text-navy underline">Privacy policy</a>.
        </span>
      </label>
      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
      <button disabled={busy || !accept} className="w-full cursor-pointer rounded-full bg-navy px-4 py-3.5 text-[15px] font-semibold text-white hover:bg-navy-soft disabled:cursor-default disabled:opacity-50">
        {busy ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}

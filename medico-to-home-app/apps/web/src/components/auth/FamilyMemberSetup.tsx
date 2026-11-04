"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { Chip, GENDERS, HealthFields, input, label, Section, splitList } from "./formParts";
import { MedicoCard } from "./MedicoCard";

const RELATIONS = ["Mother", "Father", "Spouse", "Son", "Daughter", "Grandmother", "Grandfather", "Sibling"];

interface Patient { id: string; rel: string; name: string; age: string; gender: string; [k: string]: unknown }

/** Adds a family member and builds their health card alongside, like the account's own registration. */
export function FamilyMemberSetup({ onDone, onCancel }: { onDone: (p: Patient) => void; onCancel: () => void }) {
  const [f, setF] = useState<Record<string, string>>({});
  const [conds, setConds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const set = (k: string) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));
  const pick = (k: string, value: string) => setF((x) => ({ ...x, [k]: x[k] === value ? "" : value }));
  const relation = f.rel === "Other" ? (f.relOther || "").trim() : f.rel || "";
  const allConds = [...conds, ...splitList(f.otherConds || "")];
  const card = {
    id: "new-member", name: f.name || "", relation, age: (f.age || "").replace(/\D/g, "").slice(0, 3), gender: f.gender || "",
    blood: f.blood || "", h: f.h || "", w: f.w || "", conds: allConds, alg: splitList(f.alg || ""), meds: splitList(f.meds || ""),
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!relation) return setError("Please choose how they are related to you.");
    setBusy(true);
    setError("");
    try {
      const created = await api<Patient>("/patients", { body: { name: card.name.trim(), rel: relation, age: card.age, gender: card.gender } });
      const health = {
        blood: card.blood, h: card.h, w: card.w, alg: card.alg,
        conds: card.conds.map((n) => ({ n, since: "" })), meds: card.meds.map((n) => ({ n, dose: "", freq: "" })),
      };
      await api(`/patients/${created.id}`, { method: "PUT", body: health });
      onDone({ ...created, ...health });
    } catch (err) {
      setError((err as Error).message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-12">
      <div className="flex flex-col gap-3 lg:col-span-2">
        <button type="button" onClick={onCancel} className="flex w-fit cursor-pointer items-center gap-1.5 text-sm text-muted hover:text-navy">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          Back to my profile
        </button>
        <h1 className="text-[clamp(30px,4vw,44px)] font-light leading-tight tracking-tight">
          Add a <span className="font-semibold">family member</span>
        </h1>
        <p className="max-w-2xl text-[15px] text-body">
          Their health card keeps everything a medico needs in one place, so you can book care for them in a few taps. Only their name and relationship are required.
        </p>
      </div>

      <aside className="w-full max-w-[440px] justify-self-center lg:sticky lg:top-24 lg:order-2 lg:max-w-none">
        <MedicoCard d={card} />
      </aside>

      <form onSubmit={submit} className="flex min-w-0 flex-col gap-5 lg:order-1">
        {error && <p role="alert" className="rounded-xl bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}

        <Section title="Who are they?" hint="So their medico knows who they are caring for.">
          <label className={label}>Full name *
            <input className={input} required minLength={2} autoFocus value={f.name || ""} onChange={set("name")} placeholder="e.g. Fathima K" />
          </label>
          <div className="flex flex-col gap-2 text-[13px] text-body">Relationship to you *
            <div className="flex flex-wrap gap-2">
              {[...RELATIONS, "Other"].map((r) => <Chip key={r} on={f.rel === r} onClick={() => pick("rel", r)}>{r}</Chip>)}
            </div>
          </div>
          {f.rel === "Other" && (
            <label className={label}>How are they related?
              <input className={input} value={f.relOther || ""} onChange={set("relOther")} placeholder="e.g. Aunt, Neighbour" />
            </label>
          )}
        </Section>

        <Section optional title="About them" hint="Helps us match them with the right medico.">
          <label className={`${label} sm:max-w-[200px]`}>Age (years)
            <input className={input} inputMode="numeric" maxLength={3} value={f.age || ""} onChange={set("age")} />
          </label>
          <div className="flex flex-col gap-2 text-[13px] text-body">Gender
            <div className="flex flex-wrap gap-2">{GENDERS.map((g) => <Chip key={g} on={f.gender === g} onClick={() => pick("gender", g)}>{g}</Chip>)}</div>
          </div>
        </Section>

        <HealthFields f={f} set={set} conds={conds} setConds={setConds} hint="Shared only with the medico you book for them, and only if you allow it." />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="cursor-pointer rounded-full border border-line bg-white px-8 py-3.5 text-[15px] text-navy hover:border-navy">Cancel</button>
          <button disabled={busy || card.name.trim().length < 2 || !relation} className="cursor-pointer rounded-full bg-navy px-10 py-3.5 text-[15px] font-semibold text-white hover:bg-navy-soft disabled:cursor-default disabled:opacity-50">
            {busy ? "Creating…" : "Create health card"}
          </button>
        </div>
      </form>
    </div>
  );
}

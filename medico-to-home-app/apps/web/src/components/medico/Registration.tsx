"use client";

import {
  councilsFor, displayName, emptyMedicoProfile, KERALA_DISTRICTS, MEDICO_GENDERS, MEDICO_LANGUAGES, MEDICO_ROLES, MEDICO_SLOTS,
  MEDICO_SUGGESTIONS, normaliseMedico, RADIUS_KM, registrationFor, templateBio, totalYears, YEARS_MAX, type MedicoProfile, type MedicoRole,
} from "@medico/shared";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { api, supabase } from "@/lib/api";

const input = "w-full rounded-[14px] border border-line bg-white px-4 py-3 text-[15px] font-light text-navy outline-none focus:border-navy";
const label = "flex flex-col gap-1.5 text-[13px] text-body";
const primary = "cursor-pointer rounded-full bg-navy px-7 py-3 text-[15px] font-semibold text-white hover:bg-navy-soft disabled:cursor-default disabled:opacity-50";
const secondary = "cursor-pointer rounded-full border border-line bg-white px-6 py-3 text-[15px] text-navy hover:border-navy";
const MIN_PER_STEP = 0.5;

type Stage = "loading" | "form";
interface Saved {
  account: { full_name: string; phone: string | null; email: string };
  application: { stage: string; decisionNote: string; submittedAt: string | null; profile: MedicoProfile | null } | null;
}

const STEPS: { title: string; intro: string; done: (p: MedicoProfile) => boolean }[] = [
  { title: "About you", intro: "Families trust people, not profiles. Let's start with you.", done: (p) => !!(p.name || p.role || p.specialisation || p.qualification || p.gender) },
  { title: "Photo", intro: "A friendly face puts a worried family at ease.", done: (p) => !!p.photoUrl },
  { title: "Registration", intro: "Your registration is what makes you a Verified Medico.", done: (p) => !!(p.council || p.registrationNo) },
  { title: "Contact", intro: "We only use these to reach you. Patients never see them.", done: (p) => !!(p.phone || p.email || p.district) },
  { title: "Experience", intro: "Every year you have given to patients counts. Let's add them up.", done: (p) => totalYears(p) > 0 },
  { title: "Awards", intro: "You earned these. Let families see them.", done: (p) => p.awards.some((a) => a.title) },
  { title: "Availability", intro: "Work when it suits you. You can change this anytime.", done: (p) => !!(p.slots.length || p.languages.length) },
  { title: "Your bio", intro: "Last step. Let's tell families who you are.", done: (p) => !!p.bio.trim() },
];

const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`cursor-pointer rounded-full border px-4 py-2 text-[14px] transition-colors ${on ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}>
      {children}
    </button>
  );
}

/** The 8-step Medico registration. Nothing is mandatory; the profile is saved on this device as it is filled in. */
export function Registration() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [p, setP] = useState<MedicoProfile>(emptyMedicoProfile);
  const [step, setStep] = useState(0);
  const [review, setReview] = useState<Saved["application"]>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const userId = useRef("");
  const draftKey = () => `mth-medico-${userId.current}`;

  useEffect(() => {
    let live = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return router.replace("/medico");
      userId.current = data.session.user.id;
      const meta = data.session.user.user_metadata as { full_name?: string; name?: string };
      const [saved, me] = await Promise.all([api<Saved>("/medico/profile"), api<{ professional: unknown }>("/me")]);
      if (!live) return;
      if (me.professional || saved.application?.stage === "approved") return router.replace("/pro");
      let draft: MedicoProfile | null = null;
      try {
        draft = JSON.parse(localStorage.getItem(draftKey()) || "null");
      } catch {}
      const app = saved.application && saved.application.stage !== "rejected" ? saved.application : null;
      setReview(saved.application);
      const loaded: MedicoProfile = {
        ...emptyMedicoProfile(),
        name: saved.account.full_name || meta.full_name || meta.name || "",
        email: saved.account.email,
        phone: saved.account.phone ?? "",
        ...(app?.profile ?? {}),
        ...(draft ?? {}),
      };
      setP(normaliseMedico(loaded));
      // A sent registration lives on the Medico dashboard, unless they came back to edit it.
      const editing = new URLSearchParams(window.location.search).has("edit");
      if (app?.submittedAt && app.stage !== "info_needed" && !editing && !draft) return router.replace("/pro");
      setStage("form");
    })().catch((e: Error) => live && (setError(e.message), setStage("form")));
    return () => {
      live = false;
    };
  }, [router]);

  // Keep a draft on this device so a closed tab loses nothing.
  useEffect(() => {
    if (stage !== "form" || !userId.current) return;
    try {
      localStorage.setItem(draftKey(), JSON.stringify(p));
    } catch {}
  }, [p, stage]);

  const set = (patch: Partial<MedicoProfile>) => setP((x) => ({ ...x, ...patch }));
  const goTo = (i: number) => {
    setStep(i);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const finish = async () => {
    setBusy(true);
    setError("");
    try {
      await api("/medico/profile", { method: "PUT", body: p });
      try {
        localStorage.removeItem(draftKey());
      } catch {}
      router.replace("/pro?sent=1");
      return;
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };

  if (stage === "loading") return <p className="py-24 text-center text-sm text-muted">Loading your profile…</p>;

  const done = STEPS.filter((s) => s.done(p)).length;
  const percent = Math.round((done / STEPS.length) * 100);
  const minutesLeft = Math.ceil((STEPS.length - done) * MIN_PER_STEP);
  const current = STEPS[step]!;
  const last = step === STEPS.length - 1;
  const note = review && ["info_needed", "rejected"].includes(review.stage) && review.decisionNote;

  return (
    <div className="min-h-dvh bg-[#F5F6FA]">
      <header className="sticky top-0 z-10 border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/" aria-label="Medico To Home home"><Image src="/brand/logo.svg" alt="Medico To Home" width={130} height={30} className="h-7 w-auto" unoptimized /></Link>
          <span className="text-[13px] text-muted">{percent}% done · {minutesLeft ? `about ${minutesLeft} min left` : "all done"}</span>
        </div>
        <div className="h-1 bg-[#E8F5EF]" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Registration progress">
          <div className="h-full bg-[#2E7D5B] transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-8 pb-32 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Registration steps" className="hidden lg:block">
          <ol className="sticky top-24 flex flex-col gap-1">
            {STEPS.map((s, i) => {
              const ok = s.done(p);
              return (
                <li key={s.title}>
                  <button onClick={() => goTo(i)} aria-current={i === step ? "step" : undefined}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] ${i === step ? "bg-white font-medium text-navy shadow-sm" : "text-body hover:bg-white/60"}`}>
                    <span aria-hidden className={`flex size-6 flex-none items-center justify-center rounded-full border text-[12px] ${ok ? "border-[#2E7D5B] bg-[#2E7D5B] text-white" : i === step ? "border-navy" : "border-line bg-white"}`}>
                      {ok ? "✓" : i + 1}
                    </span>
                    {s.title}
                    {ok && <span className="sr-only">(completed)</span>}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <section key={step} className="fade-up flex flex-col gap-6 rounded-[24px] border border-line bg-white p-6 sm:p-9">
          {note && (
            <div role="status" className="rounded-[14px] bg-[#FBF6EA] px-4 py-3 text-[14px] leading-relaxed text-[#7A5410]">
              <strong className="font-medium">{review!.stage === "info_needed" ? "Our team needs a few more details: " : "Your last registration was not approved: "}</strong>
              {note}
            </div>
          )}
          <div>
            <p className="text-[13px] text-muted">Step {step + 1} of {STEPS.length}</p>
            <h1 className="mt-1 text-[30px] font-light tracking-[-.03em]">{current.title}</h1>
            <p className="mt-1.5 text-[15px] text-body">{current.intro}</p>
          </div>

          {step === 0 && <AboutStep p={p} set={set} />}
          {step === 1 && <PhotoStep p={p} set={set} />}
          {step === 2 && <RegistrationStep p={p} set={set} />}
          {step === 3 && <ContactStep p={p} set={set} />}
          {step === 4 && <ExperienceStep p={p} set={set} />}
          {step === 5 && <AwardsStep p={p} set={set} />}
          {step === 6 && <AvailabilityStep p={p} set={set} />}
          {step === 7 && <BioStep p={p} set={set} onEdit={goTo} />}

          {error && <p role="alert" className="text-sm text-bad">{error}</p>}
        </section>
      </div>

      <footer className="keyboard-hide fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3">
          {step > 0 ? <button onClick={() => goTo(step - 1)} className={secondary}>Back</button> : <span />}
          <div className="flex items-center gap-3">
            {!current.done(p) && !last && <button onClick={() => goTo(step + 1)} className="cursor-pointer px-3 py-3 text-[15px] text-muted underline hover:text-navy">Skip</button>}
            {last ? (
              <button onClick={finish} disabled={busy} className={primary}>{busy ? "Saving…" : "Finish"}</button>
            ) : (
              <button onClick={() => goTo(step + 1)} className={primary}>Continue</button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

type StepProps = { p: MedicoProfile; set: (patch: Partial<MedicoProfile>) => void };

/**
 * A text field with suggestions that narrow as you type. Anything not on the list can be added as it is typed.
 * Follows the ARIA combobox pattern: arrow keys move through the list, Enter picks, Escape closes.
 */
function Suggest({ label: text, value, options, onChange, placeholder }: { label: string; value: string; options: string[]; onChange: (v: string) => void; placeholder: string }) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const q = value.trim().toLowerCase();
  // Names that start with what was typed come first, then those that contain it anywhere.
  const matches = q ? [...options.filter((o) => o.toLowerCase().startsWith(q)), ...options.filter((o) => !o.toLowerCase().startsWith(q) && o.toLowerCase().includes(q))] : options;
  const custom = q && !options.some((o) => o.toLowerCase() === q) ? value.trim() : "";
  const items = custom ? [...matches, custom] : matches;
  const shown = open && items.length > 0;

  // Close when a tap or click lands outside the field and its list.
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setActive(-1);
  };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + items.length) % items.length);
    } else if (e.key === "Enter" && shown && active >= 0) {
      e.preventDefault();
      pick(items[active]!);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
  };
  // Bold the part of a suggestion that matches what was typed.
  const mark = (o: string) => {
    const at = q ? o.toLowerCase().indexOf(q) : -1;
    return at < 0 ? o : <>{o.slice(0, at)}<b className="font-medium">{o.slice(at, at + q.length)}</b>{o.slice(at + q.length)}</>;
  };

  return (
    <div ref={box} className={`${label} relative`}>
      <label htmlFor={`${id}-input`}>{text}</label>
      <input id={`${id}-input`} className={input} value={value} placeholder={placeholder} autoComplete="off" role="combobox"
        aria-expanded={shown} aria-controls={`${id}-list`} aria-autocomplete="list" aria-activedescendant={shown && active >= 0 ? `${id}-${active}` : undefined}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(-1); }}
        onFocus={() => setOpen(true)} onClick={() => setOpen(true)} onKeyDown={onKey}
        onBlur={(e) => e.relatedTarget && !box.current?.contains(e.relatedTarget) && setOpen(false)} />
      {shown && (
        <ul id={`${id}-list`} role="listbox" aria-label={text}
          className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-64 overflow-y-auto overscroll-contain rounded-[14px] border border-line bg-white py-1.5 shadow-[0_14px_34px_rgba(2,8,77,.10)]">
          {items.map((o, i) => (
            <li key={`${o}-${i}`} id={`${id}-${i}`} role="option" aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()} onClick={() => pick(o)} onMouseMove={() => active !== i && setActive(i)}
              className={`cursor-pointer px-4 py-2.5 text-[15px] font-light text-navy ${i === active ? "bg-wash" : ""} ${o === custom && i === items.length - 1 ? "border-t border-line-soft" : ""}`}>
              {o === custom && i === items.length - 1 ? <span className="flex items-center gap-2"><span aria-hidden className="text-muted">+</span>Add “{custom}”</span> : mark(o)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AboutStep({ p, set }: StepProps) {
  const suggestions = MEDICO_SUGGESTIONS[p.role as MedicoRole];
  const example = (list: string[] | undefined, fallback: string) => (list ? `E.g. ${list.slice(0, 2).join(", ")}` : fallback);
  // Changing role clears a specialisation or qualification picked from the old role's list; anything typed in stays.
  const pickRole = (r: MedicoRole) => {
    const role = p.role === r ? "" : r;
    const next = MEDICO_SUGGESTIONS[role as MedicoRole];
    const keep = (v: string, key: "specialisations" | "qualifications") => (suggestions?.[key].includes(v) && !next?.[key].includes(v) ? "" : v);
    // A council that does not belong to the new role is cleared too, as the API would drop it.
    const council = councilsFor(role).includes(p.council) ? p.council : "";
    set({ role, council, specialisation: keep(p.specialisation, "specialisations"), qualification: keep(p.qualification, "qualifications") });
  };
  return (
    <div className="grid gap-5">
      <label className={label}>Full name<input className={input} value={p.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" placeholder="As on your registration certificate" /></label>
      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-[13px] text-body">What do you do?</legend>
        <div className="flex flex-wrap gap-2">{MEDICO_ROLES.map((r) => <Chip key={r} on={p.role === r} onClick={() => pickRole(r)}>{r}</Chip>)}</div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <Suggest label="Specialisation" value={p.specialisation} options={suggestions?.specialisations ?? []} onChange={(v) => set({ specialisation: v })}
          placeholder={example(suggestions?.specialisations, "Choose what you do to see suggestions")} />
        <Suggest label="Highest qualification" value={p.qualification} options={suggestions?.qualifications ?? []} onChange={(v) => set({ qualification: v })}
          placeholder={example(suggestions?.qualifications, "Choose what you do to see suggestions")} />
      </div>
      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-[13px] text-body">Gender</legend>
        <div className="flex flex-wrap gap-2">{MEDICO_GENDERS.map((g) => <Chip key={g} on={p.gender === g} onClick={() => set({ gender: p.gender === g ? "" : g })}>{g}</Chip>)}</div>
      </fieldset>
    </div>
  );
}

function PhotoStep({ p, set }: StepProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const { uploadUrl, publicUrl } = await api<{ uploadUrl: string; publicUrl: string }>("/medico/photo/sign", { body: { contentType: file.type, size: file.size } });
      const res = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!res.ok) throw new Error("The photo did not upload. Please try again.");
      set({ photoUrl: publicUrl });
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };
  return (
    <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="flex flex-col items-center gap-3">
        <label className="relative flex size-40 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-line bg-[#F5F6FA] hover:border-navy">
          {p.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.photoUrl} alt="Your profile photo" className="size-full object-cover" />
          ) : (
            <span className="px-6 text-center text-[13px] text-muted">{busy ? "Uploading…" : "Tap to add a photo"}</span>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} aria-label="Choose a profile photo" />
        </label>
        {p.photoUrl && <button type="button" onClick={() => set({ photoUrl: "" })} className="cursor-pointer text-[13px] text-muted underline hover:text-navy">Remove photo</button>}
        {error && <p role="alert" className="text-center text-sm text-bad">{error}</p>}
      </div>
      <div className="grid gap-3 text-[14px] text-body">
        <p className="rounded-[14px] bg-[#E8F5EF] px-4 py-3 text-[#2E7D5B]">Profiles with a clear photo get <strong className="font-semibold">3× more bookings</strong>.</p>
        <ul className="grid list-disc gap-1.5 pl-5">
          <li>Face the camera, in good daylight</li>
          <li>Wear your uniform or work clothes</li>
          <li>Just you, no sunglasses or group photos</li>
          <li>JPG, PNG or WebP, up to 5 MB</li>
        </ul>
      </div>
    </div>
  );
}

function RegistrationStep({ p, set }: StepProps) {
  // Only the councils or certifying bodies that fit the role chosen in step 1.
  const spec = registrationFor(p.role);
  return (
    <div className="grid gap-5">
      <label className={label}>{spec.bodyLabel}
        <select className={input} value={p.council} onChange={(e) => set({ council: e.target.value })}>
          <option value="">Choose one</option>
          {spec.groups.map((g) => <optgroup key={g.label} label={g.label}>{g.options.map((c) => <option key={c}>{c}</option>)}</optgroup>)}
        </select>
      </label>
      <label className={label}>{spec.numberLabel}<input className={`${input} uppercase`} value={p.registrationNo} onChange={(e) => set({ registrationNo: e.target.value.toUpperCase() })} placeholder={spec.placeholder} autoCapitalize="characters" /></label>
      <p className="rounded-[14px] bg-[#E8F5EF] px-4 py-3 text-[14px] leading-relaxed text-[#2E7D5B]">Our team checks it with {spec.checkedWith} within 24–48 hours. Once verified, your profile shows the <strong className="font-semibold">Verified Medico</strong> badge.</p>
    </div>
  );
}

function ContactStep({ p, set }: StepProps) {
  return (
    <div className="grid gap-5">
      <label className={label}>Mobile number
        <span className="flex items-center gap-2 rounded-[14px] border border-line bg-white px-4 focus-within:border-navy">
          <span className="text-[15px] text-muted">+91</span>
          <input className="w-full bg-transparent py-3 text-[15px] font-light outline-none" inputMode="numeric" autoComplete="tel-national" value={p.phone} onChange={(e) => set({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit mobile" />
        </span>
      </label>
      <label className={label}>Email<input className={input} type="email" autoComplete="email" value={p.email} onChange={(e) => set({ email: e.target.value })} /></label>
      <label className={label}>Home district
        <select className={input} value={p.district} onChange={(e) => set({ district: e.target.value })}>
          <option value="">Choose your district</option>
          {KERALA_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
        </select>
      </label>
      <p className="text-[13px] text-muted">Your mobile number and email are never shown on your profile.</p>
    </div>
  );
}

function ExperienceStep({ p, set }: StepProps) {
  const now = new Date().getFullYear();
  const places = p.workplaces;
  const setPlace = (i: number, patch: Partial<MedicoProfile["workplaces"][number]>) => set({ workplaces: places.map((w, j) => (j === i ? { ...w, ...patch } : w)) });
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="How to add your experience">
        {([["years", "Just total years", "Quickest"], ["workplaces", "Add each workplace", "Families like seeing where you worked"]] as const).map(([mode, title, sub]) => (
          <button key={mode} type="button" role="radio" aria-checked={p.experienceMode === mode} onClick={() => set({ experienceMode: mode })}
            className={`cursor-pointer rounded-[18px] border p-4 text-left ${p.experienceMode === mode ? "border-navy bg-[#F5F6FA]" : "border-line hover:border-navy"}`}>
            <span className="block text-[15px] font-medium">{title}</span>
            <span className="text-[13px] text-muted">{sub}</span>
          </button>
        ))}
      </div>
      {p.experienceMode === "years" ? (
        <div className="grid gap-4">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => set({ years: Math.max(0, p.years - 1) })} aria-label="One year less" className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-line text-xl hover:border-navy">−</button>
            <span className="min-w-24 text-center text-[32px] font-light" aria-live="polite">{p.years} <span className="text-[15px] text-muted">{p.years === 1 ? "year" : "years"}</span></span>
            <button type="button" onClick={() => set({ years: Math.min(YEARS_MAX, p.years + 1) })} aria-label="One year more" className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-line text-xl hover:border-navy">+</button>
          </div>
          <input type="range" min={0} max={YEARS_MAX} value={p.years} onChange={(e) => set({ years: Number(e.target.value) })} aria-label="Years of experience" className="accent-navy" />
        </div>
      ) : (
        <div className="grid gap-3">
          {places.map((w, i) => (
            <div key={i} className="grid gap-3 rounded-[18px] border border-line p-4 sm:grid-cols-2">
              <label className={label}>Hospital or clinic<input className={input} value={w.place} onChange={(e) => setPlace(i, { place: e.target.value })} /></label>
              <label className={label}>Your role<input className={input} value={w.role} onChange={(e) => setPlace(i, { role: e.target.value })} placeholder="E.g. Staff Nurse" /></label>
              <label className={label}>From year<input className={input} inputMode="numeric" maxLength={4} value={w.from} onChange={(e) => setPlace(i, { from: e.target.value.replace(/\D/g, "") })} placeholder={String(now - 5)} /></label>
              <label className={label}>To year
                <span className="flex items-center gap-3">
                  <input className={input} inputMode="numeric" maxLength={4} disabled={w.to === "Present"} value={w.to === "Present" ? "" : w.to} onChange={(e) => setPlace(i, { to: e.target.value.replace(/\D/g, "") })} placeholder={w.to === "Present" ? "Present" : String(now)} />
                  <span className="flex flex-none items-center gap-1.5 text-[13px]"><input type="checkbox" checked={w.to === "Present"} onChange={(e) => setPlace(i, { to: e.target.checked ? "Present" : "" })} className="accent-navy" />Present</span>
                </span>
              </label>
              <button type="button" onClick={() => set({ workplaces: places.filter((_, j) => j !== i) })} className="cursor-pointer justify-self-start text-[13px] text-muted underline hover:text-navy">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => set({ workplaces: [...places, { place: "", role: "", from: "", to: "" }] })} className={`${secondary} justify-self-start`}>+ Add workplace</button>
          <p className="text-[15px]">Total: <strong className="font-semibold">{totalYears(p)} years</strong></p>
        </div>
      )}
    </div>
  );
}

function AwardsStep({ p, set }: StepProps) {
  const setAward = (i: number, patch: Partial<MedicoProfile["awards"][number]>) => set({ awards: p.awards.map((a, j) => (j === i ? { ...a, ...patch } : a)) });
  return (
    <div className="grid gap-3">
      {p.awards.length === 0 && (
        <div className="rounded-[18px] border border-dashed border-[#E9D9B0] bg-[#FBF6EA] p-5 text-[14px] leading-relaxed text-[#7A5410]">
          Hospital awards, COVID or flood-duty certificates, research papers or prizes all count. Skip this step if you have none yet.
        </div>
      )}
      {p.awards.map((a, i) => (
        <div key={i} className="grid gap-3 rounded-[18px] border border-[#E9D9B0] bg-[#FBF6EA] p-4 sm:grid-cols-[1fr_1fr_110px]">
          <label className={label}>Award<input className={input} value={a.title} onChange={(e) => setAward(i, { title: e.target.value })} placeholder="E.g. Best Nurse Award" /></label>
          <label className={label}>Awarded by<input className={input} value={a.by} onChange={(e) => setAward(i, { by: e.target.value })} placeholder="E.g. Govt. Medical College" /></label>
          <label className={label}>Year<input className={input} inputMode="numeric" maxLength={4} value={a.year} onChange={(e) => setAward(i, { year: e.target.value.replace(/\D/g, "") })} /></label>
          <button type="button" onClick={() => set({ awards: p.awards.filter((_, j) => j !== i) })} className="cursor-pointer justify-self-start text-[13px] text-[#7A5410] underline">Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => set({ awards: [...p.awards, { title: "", by: "", year: "" }] })} className={`${secondary} justify-self-start`}>+ Add award</button>
    </div>
  );
}

function AvailabilityStep({ p, set }: StepProps) {
  return (
    <div className="grid gap-6">
      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-[13px] text-body">When are you usually free?</legend>
        <div className="flex flex-wrap gap-2">{MEDICO_SLOTS.map((s) => <Chip key={s} on={p.slots.includes(s)} onClick={() => set({ slots: toggle(p.slots, s) })}>{s}</Chip>)}</div>
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-[13px] text-body">Languages you speak</legend>
        <div className="flex flex-wrap gap-2">{MEDICO_LANGUAGES.map((l) => <Chip key={l} on={p.languages.includes(l)} onClick={() => set({ languages: toggle(p.languages, l) })}>{l}</Chip>)}</div>
      </fieldset>
      <label className={label}>
        <span>How far will you travel? <strong className="font-semibold text-navy">{p.radiusKm} km</strong></span>
        <input type="range" min={RADIUS_KM.min} max={RADIUS_KM.max} value={p.radiusKm} onChange={(e) => set({ radiusKm: Number(e.target.value) })} className="accent-navy" />
        <span className="flex justify-between text-[12px] text-muted"><span>{RADIUS_KM.min} km</span><span>{RADIUS_KM.max} km</span></span>
      </label>
    </div>
  );
}

function BioStep({ p, set, onEdit }: StepProps & { onEdit: (step: number) => void }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const write = async () => {
    setBusy(true);
    setNote("");
    try {
      const r = await api<{ bio: string; source: "ai" | "template" }>("/medico/bio", { body: p });
      set({ bio: r.bio });
      if (r.source === "template") setNote("Written from your details. AI writing is not available right now.");
    } catch {
      set({ bio: templateBio(p) });
      setNote("Written from your details. AI writing is not available right now.");
    }
    setBusy(false);
  };
  const rows: [string, string, number][] = [
    ["Name", displayName(p), 0], ["Role", [p.role, p.specialisation].filter(Boolean).join(" · "), 0], ["Qualification", p.qualification, 0],
    ["Photo", p.photoUrl ? "Added" : "", 1], ["Registration", [p.council, p.registrationNo].filter(Boolean).join(" · "), 2],
    ["District", p.district, 3], ["Experience", totalYears(p) ? `${totalYears(p)} years` : "", 4], ["Awards", p.awards.filter((a) => a.title).map((a) => a.title).join(", "), 5],
    ["Languages", p.languages.join(", "), 6], ["Travel", `Up to ${p.radiusKm} km`, 6],
  ];
  return (
    <div className="grid gap-6">
      <dl className="grid gap-0 divide-y divide-line-soft rounded-[18px] border border-line">
        {rows.map(([k, v, s]) => (
          <div key={k} className="flex items-center justify-between gap-4 px-4 py-2.5 text-[14px]">
            <dt className="w-28 flex-none text-muted">{k}</dt>
            <dd className={`flex-1 truncate ${v ? "" : "text-faint"}`}>{v || "Not added"}</dd>
            <button type="button" onClick={() => onEdit(s)} className="cursor-pointer text-[13px] text-navy underline">Edit</button>
          </div>
        ))}
      </dl>
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="bio" className="text-[13px] text-body">Profile bio</label>
          <button type="button" onClick={write} disabled={busy} className={`${secondary} py-2 text-[14px]`}>{busy ? "Writing…" : p.bio ? "✦ Rewrite with AI" : "✦ Write my bio with AI"}</button>
        </div>
        <textarea id="bio" rows={5} className={`${input} leading-relaxed`} value={p.bio} onChange={(e) => set({ bio: e.target.value })} placeholder="2–3 sentences about your experience and how you care for patients." />
        <p className="text-[12px] text-muted">{note || "The AI uses only the details you entered, never your phone number or email. Edit it as you like."}</p>
      </div>
    </div>
  );
}

"use client";

import {
  canConsultOnline, councilsFor, DAY_PARTS, MEDICO_CATEGORY, displayName, hasTimetable, inDayOrder, MAX_SERVICES, OTHER_COUNCIL, shortTime, SLOT_TIMES, timetableSummary, WEEKDAYS, weeklySlotCount,
  type MedicoService, type Weekday,
  emptyMedicoProfile, KERALA_DISTRICTS, MEDICO_GENDERS, MEDICO_LANGUAGES, MEDICO_ROLES,
  medicoPlace, MEDICO_SUGGESTIONS, normaliseMedico, registrationFor, spokenLanguages, templateBio, totalYears, townsIn, YEARS_MAX, type MedicoProfile, type MedicoRole,
} from "@medico/shared";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { api, supabase } from "@/lib/api";

const input = "w-full rounded-[14px] border border-line bg-white px-4 py-3 text-[15px] font-light text-navy outline-none focus:border-navy disabled:bg-wash disabled:text-faint";
const label = "flex flex-col gap-1.5 text-[13px] text-body";
const primary = "flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-navy px-6 text-[15px] font-semibold text-white hover:bg-navy-soft disabled:cursor-default disabled:opacity-50";
const secondary = "flex h-12 cursor-pointer items-center justify-center rounded-full border border-line bg-white px-6 text-[15px] text-navy hover:border-navy";
const small = "cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-[14px] text-navy hover:border-navy";
const MIN_PER_STEP = 0.5;
const BIO_MAX = 1200;

type Stage = "loading" | "form";
type Errors = Record<string, string>;
interface Saved {
  account: { full_name: string; phone: string | null; email: string };
  application: { stage: string; decisionNote: string; submittedAt: string | null; profile: MedicoProfile | null } | null;
}

const STEPS: { title: string; intro: string; optional?: boolean; done: (p: MedicoProfile) => boolean }[] = [
  { title: "About you", intro: "Let's start with the basics.", done: (p) => !!(p.name || p.role || p.specialisation || p.qualification || p.gender) },
  { title: "Profile photo", intro: "A clear photo helps families trust you.", optional: true, done: (p) => !!p.photoUrl },
  { title: "Registration", intro: "This is how we verify you.", done: (p) => !!(p.council || p.registrationNo) },
  { title: "Contact & area", intro: "Only our team sees your number and email.", done: (p) => !!(p.phone || p.district) },
  { title: "Experience", intro: "Add your total years, or each place you worked.", optional: true, done: (p) => totalYears(p) > 0 },
  { title: "Awards", intro: "Awards, duty certificates or papers. Skip if you have none.", optional: true, done: (p) => p.awards.some((a) => a.title) },
  { title: "Availability & languages", intro: "When families can book you.", done: (p) => hasTimetable(p) },
  { title: "Services & charges", intro: "We suggested the usual ones. Change anything.", done: (p) => p.services.some((x) => x.name && x.price > 0) },
  { title: "Review & submit", intro: "Add your bio and check your details.", done: (p) => !!p.bio.trim() },
];

/** What still needs fixing on a step before moving on. Optional steps never block. */
function problems(step: number, p: MedicoProfile, live: boolean): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!p.name.trim()) e.name = "Enter your full name";
    if (!p.role) e.role = "Choose what you do";
  }
  if (step === 2 && !live) {
    if (!p.council) e.council = `Choose one from the list`;
    if (!p.registrationNo.trim() && p.council !== OTHER_COUNCIL) e.registrationNo = `Enter your ${registrationFor(p.role).numberLabel.toLowerCase()}`;
  }
  if (step === 3) {
    if (!/^\d{10}$/.test(p.phone)) e.phone = p.phone ? "A mobile number has 10 digits" : "Enter your mobile number";
    if (p.email && !/^\S+@\S+\.\S+$/.test(p.email)) e.email = "Check your email address";
    if (!p.district) e.district = "Choose your district";
  }
  if (step === 6) {
    if (!hasTimetable(p)) e.weekly = "Pick your days and hours, or choose 24×7";
    if (!spokenLanguages(p).length) e.languages = "Pick at least one language";
  }
  if (step === 7) {
    p.services.forEach((x, i) => {
      if (x.name.trim() && !x.price) e[`price${i}`] = "Add a charge";
      if (!x.name.trim() && x.price) e[`name${i}`] = "Name this service";
    });
    if (!p.services.some((x) => x.name.trim() && x.price > 0)) e.services = "Add at least one service with a charge";
  }
  if (step === 8 && !p.bio.trim()) e.bio = "Add a short bio, or tap Write with AI";
  return e;
}

const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
const field = (error?: string) => (error ? input.replace("border-line", "border-bad").replace("focus:border-navy", "focus:border-bad") : input);
// The look of a field with a prefix (+91, ₹) inside it.
const boxed = (error?: string) => `flex items-center gap-1.5 rounded-[14px] border bg-white px-4 ${error ? "border-bad" : "border-line focus-within:border-navy"}`;

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`cursor-pointer rounded-full border px-4 py-2 text-[14px] transition-colors ${on ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}>
      {children}
    </button>
  );
}

/** An on/off switch; the label around it names it. */
function Switch({ checked, onChange }: { checked: boolean; onChange: (on: boolean) => void }) {
  return (
    <span className="relative inline-flex h-7 w-12 flex-none">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="peer absolute inset-0 cursor-pointer appearance-none rounded-full bg-line transition-colors checked:bg-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy" />
      <span aria-hidden className="pointer-events-none absolute top-1 left-1 size-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
    </span>
  );
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <span role="alert" className="flex items-center gap-1.5 text-[12px] text-bad">
      <svg aria-hidden width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9.5" /><path d="M12 7.5v5.5M12 16.5v.01" /></svg>
      {msg}
    </span>
  );
}

/** A labelled field: a red * for required, "optional" for the rest, and its error underneath. */
function Field({ text, req, optional, error, hint, children }: { text: string; req?: boolean; optional?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className={label} data-invalid={error ? "" : undefined}>
      <span>{text}{req && <span aria-hidden className="text-bad"> *</span>}{optional && <span className="text-faint"> (optional)</span>}</span>
      {children}
      {error ? <Err msg={error} /> : hint && <span className="text-[12px] text-muted">{hint}</span>}
    </label>
  );
}

const Arrow = () => <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;

/** The 9-step Medico registration. The draft is kept on this device as it is filled in, so leaving loses nothing. */
export function Registration() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [p, setP] = useState<MedicoProfile>(emptyMedicoProfile);
  const [step, setStep] = useState(0);
  const [tried, setTried] = useState(false);
  const [review, setReview] = useState<Saved["application"]>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // Approved: changes go straight to the live listing, and the verified details are locked.
  const [live, setLive] = useState(false);
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
      // Approved Medicos come here only to edit, from their profile.
      const editing = new URLSearchParams(window.location.search).has("edit");
      const approved = !!me.professional || saved.application?.stage === "approved";
      if (approved && !editing) return router.replace("/pro");
      setLive(approved);
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
    setTried(false);
    setError("");
    window.scrollTo({ top: 0 });
  };
  // Show the step's problems and bring the first one into view.
  const flag = () => {
    setTried(true);
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>("[data-invalid]");
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.querySelector<HTMLElement>("input:not([type=checkbox], [type=range], [type=file]), textarea")?.focus({ preventScroll: true });
    });
  };

  // Backing out of an edit drops the draft, so the profile shows as it was saved.
  const cancelEdit = () => {
    try {
      localStorage.removeItem(draftKey());
    } catch {}
    router.push("/pro/profile");
  };
  const leave = () => (live ? cancelEdit() : router.push("/"));

  const finish = async () => {
    // Every required step has to be complete before sending, wherever it was skipped from.
    const gap = STEPS.findIndex((_, i) => Object.keys(problems(i, p, live)).length > 0);
    if (gap >= 0) {
      if (gap !== step) goTo(gap);
      flag();
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api("/medico/profile", { method: "PUT", body: p });
      try {
        localStorage.removeItem(draftKey());
      } catch {}
      router.replace(live ? "/pro/profile" : "/pro?sent=1");
      return;
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };

  if (stage === "loading") return <p className="py-24 text-center text-sm text-muted">Loading your profile…</p>;

  const complete = (i: number) => STEPS[i]!.done(p) && Object.keys(problems(i, p, live)).length === 0;
  const done = STEPS.filter((_, i) => complete(i)).length;
  const percent = Math.round((done / STEPS.length) * 100);
  const minutesLeft = Math.ceil((STEPS.length - done) * MIN_PER_STEP);
  const current = STEPS[step]!;
  const last = step === STEPS.length - 1;
  const errs = tried ? problems(step, p, live) : {};
  const note = review && ["info_needed", "rejected"].includes(review.stage) && review.decisionNote;
  const next = () => (Object.keys(problems(step, p, live)).length ? flag() : goTo(step + 1));

  return (
    <div className="min-h-dvh bg-white sm:bg-[#F5F6FA]">
      <header className="sticky top-0 z-20 border-b border-line bg-white pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-1 px-2 sm:h-16 sm:px-5">
          <button onClick={() => (step ? goTo(step - 1) : leave())} aria-label={step ? "Previous step" : "Leave registration"}
            className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-full text-navy hover:bg-wash lg:hidden">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          </button>
          <Link href="/" aria-label="Medico To Home home" className="hidden lg:block"><Image src="/brand/logo.svg" alt="Medico To Home" width={130} height={30} className="h-10 w-auto" unoptimized /></Link>
          <p className="min-w-0 flex-1 truncate text-[13px] text-muted lg:text-right">
            <span className="lg:hidden">Step {step + 1} of {STEPS.length} · </span>{percent}% complete<span className="hidden sm:inline">{minutesLeft ? ` · about ${minutesLeft} min left` : ""}</span>
          </p>
          <button onClick={leave} className="flex-none cursor-pointer rounded-full px-3 py-2 text-[14px] text-navy hover:bg-wash lg:ml-3">{live ? "Cancel" : "Save & exit"}</button>
        </div>
        <div className="mx-auto flex max-w-5xl gap-1 px-4 pb-3 sm:px-5" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Registration progress">
          {STEPS.map((s, i) => (
            <span key={s.title} className={`h-1 flex-1 rounded-full transition-colors ${i === step ? "bg-navy" : complete(i) ? "bg-good" : "bg-line"}`} />
          ))}
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 pt-5 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-5 sm:pt-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Registration steps" className="hidden lg:block">
          <ol className="sticky top-28 flex flex-col gap-1">
            {STEPS.map((s, i) => {
              const ok = complete(i);
              return (
                <li key={s.title}>
                  <button onClick={() => goTo(i)} aria-current={i === step ? "step" : undefined}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] ${i === step ? "bg-white font-medium text-navy shadow-sm" : "text-body hover:bg-white/60"}`}>
                    <span aria-hidden className={`flex size-6 flex-none items-center justify-center rounded-full border text-[12px] ${ok ? "border-good bg-good text-white" : i === step ? "border-navy" : "border-line bg-white"}`}>
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

        <section key={step} className="fade-up flex min-w-0 flex-col gap-6 overflow-x-clip sm:rounded-[24px] sm:border sm:border-line sm:bg-white sm:p-8 lg:p-9">
          {note && (
            <div role="status" className="rounded-[14px] bg-[#FBF6EA] px-4 py-3 text-[14px] leading-relaxed text-[#7A5410]">
              <strong className="font-medium">{review!.stage === "info_needed" ? "Our team needs a few more details: " : "Your last registration was not approved: "}</strong>
              {note}
            </div>
          )}
          <div>
            <p className="hidden text-[13px] text-muted lg:block">Step {step + 1} of {STEPS.length}</p>
            <h1 className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[24px] leading-tight font-medium tracking-[-.02em] sm:text-[28px] lg:mt-1">
              {last && live ? "Review & save" : current.title}
              {current.optional && <span className="rounded-full bg-wash px-2.5 py-0.5 text-[12px] font-normal tracking-normal text-muted">Optional</span>}
            </h1>
            <p className="mt-1.5 text-[14px] text-body sm:text-[15px]">{current.intro}</p>
          </div>

          {step === 0 && <AboutStep p={p} set={set} err={errs} locked={live} />}
          {step === 1 && <PhotoStep p={p} set={set} err={errs} />}
          {step === 2 && <RegistrationStep p={p} set={set} err={errs} locked={live} />}
          {step === 3 && <ContactStep p={p} set={set} err={errs} />}
          {step === 4 && <ExperienceStep p={p} set={set} err={errs} />}
          {step === 5 && <AwardsStep p={p} set={set} err={errs} />}
          {step === 6 && <AvailabilityStep p={p} set={set} err={errs} />}
          {step === 7 && <ServicesStep p={p} set={set} err={errs} onEdit={goTo} />}
          {step === 8 && <ReviewStep p={p} set={set} err={errs} onEdit={goTo} missing={(i) => i !== 8 && Object.keys(problems(i, p, live)).length > 0} live={live} />}

          {error && <Err msg={error} />}
        </section>
      </div>

      {/* Steps aside while the phone keyboard is open, so it never covers a field. */}
      <footer className="keyboard-hide fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-5xl gap-3 px-4 py-3 sm:px-5 lg:justify-end">
          {/* On a phone the last step gives Submit the full width; the arrow at the top still goes back. */}
          {step > 0 && <button onClick={() => goTo(step - 1)} className={`${secondary} flex-1 lg:w-36 lg:flex-none ${last ? "max-sm:hidden" : ""}`}>Back</button>}
          {last ? (
            <button onClick={finish} disabled={busy} className={`${primary} flex-[1.7] whitespace-nowrap lg:min-w-56 lg:flex-none`}>{busy ? "Sending…" : live ? "Save changes" : "Submit for verification"}{!busy && <Arrow />}</button>
          ) : (
            <button onClick={next} className={`${primary} flex-[1.7] lg:min-w-44 lg:flex-none`}>Continue<Arrow /></button>
          )}
        </div>
      </footer>
    </div>
  );
}

type StepProps = { p: MedicoProfile; set: (patch: Partial<MedicoProfile>) => void; err: Errors };

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
      <label htmlFor={`${id}-input`}>{text}<span className="text-faint"> (optional)</span></label>
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

const VERIFIED_NOTE = "Verified when you were approved. To change it, please contact our team.";

function AboutStep({ p, set, err, locked }: StepProps & { locked?: boolean }) {
  const suggestions = MEDICO_SUGGESTIONS[p.role as MedicoRole];
  const example = (list: string[] | undefined, fallback: string) => (list ? `E.g. ${list.slice(0, 2).join(", ")}` : fallback);
  // Changing role clears a specialisation or qualification picked from the old role's list; anything typed in stays.
  const pickRole = (role: string) => {
    const next = MEDICO_SUGGESTIONS[role as MedicoRole];
    const keep = (v: string, key: "specialisations" | "qualifications") => (suggestions?.[key].includes(v) && !next?.[key].includes(v) ? "" : v);
    // A council that does not belong to the new role is cleared too, as the API would drop it.
    const council = councilsFor(role).includes(p.council) ? p.council : "";
    set({ role, council, specialisation: keep(p.specialisation, "specialisations"), qualification: keep(p.qualification, "qualifications") });
  };
  return (
    <div className="grid gap-5">
      <Field text="Full name" req error={err.name}>
        <input className={field(err.name)} value={p.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" placeholder="As on your registration certificate" />
      </Field>
      {locked ? (
        <div className={label}>Professional role<p className="text-[15px] text-navy">{p.role}<span className="block text-[12px] text-muted">{VERIFIED_NOTE}</span></p></div>
      ) : (
        <Field text="Professional role" req error={err.role}>
          <select className={field(err.role)} value={p.role} onChange={(e) => pickRole(e.target.value)}>
            <option value="">Choose your role</option>
            {MEDICO_ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Suggest label="Specialisation" value={p.specialisation} options={suggestions?.specialisations ?? []} onChange={(v) => set({ specialisation: v })}
          placeholder={example(suggestions?.specialisations, "Choose your role for suggestions")} />
        <Suggest label="Highest qualification" value={p.qualification} options={suggestions?.qualifications ?? []} onChange={(v) => set({ qualification: v })}
          placeholder={example(suggestions?.qualifications, "Choose your role for suggestions")} />
      </div>
      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-[13px] text-body">Gender<span className="text-faint"> (optional)</span></legend>
        <div className="grid grid-cols-3 gap-2">{MEDICO_GENDERS.map((g) => <Chip key={g} on={p.gender === g} onClick={() => set({ gender: p.gender === g ? "" : g })}>{g}</Chip>)}</div>
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
    <div className="grid gap-5">
      <div className="flex items-center gap-5">
        <label className="relative flex size-28 flex-none cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-line bg-wash hover:border-navy sm:size-36">
          {p.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.photoUrl} alt="Your profile photo" className="size-full object-cover" />
          ) : (
            <svg aria-hidden width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6B7085" strokeWidth="1.5" strokeLinejoin="round"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} aria-label="Choose a profile photo" />
        </label>
        <div className="grid justify-items-start gap-2.5">
          <label className={`${small} relative`}>
            {busy ? "Uploading…" : p.photoUrl ? "Change photo" : "Choose photo"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          {p.photoUrl && <button type="button" onClick={() => set({ photoUrl: "" })} className="cursor-pointer px-1 text-[13px] text-muted underline hover:text-navy">Remove</button>}
          <span className="text-[12px] text-muted">JPG, PNG or WebP · up to 5 MB</span>
        </div>
      </div>
      {error && <Err msg={error} />}
      <div className="grid gap-2 rounded-[16px] bg-wash p-4 text-[13px] text-body">
        <p className="font-medium text-good">Profiles with a clear photo get 3× more bookings.</p>
        <p>Face the camera in good light, wear your uniform or work clothes, and keep it just you.</p>
      </div>
    </div>
  );
}

function RegistrationStep({ p, set, err, locked }: StepProps & { locked?: boolean }) {
  // Only the councils or certifying bodies that fit the role chosen in step 1.
  const spec = registrationFor(p.role);
  if (locked) {
    return (
      <dl className="grid gap-3 rounded-[16px] border border-line px-4 py-3 text-[14px]">
        <div><dt className="text-[13px] text-muted">{spec.bodyLabel}</dt><dd>{p.council || "Not added"}</dd></div>
        <div><dt className="text-[13px] text-muted">{spec.numberLabel}</dt><dd>{p.registrationNo || "Not added"}</dd></div>
        <p className="text-[12px] text-muted">{VERIFIED_NOTE}</p>
      </dl>
    );
  }
  return (
    <div className="grid gap-5">
      <Field text={spec.bodyLabel} req error={err.council}>
        <select className={field(err.council)} value={p.council} onChange={(e) => set({ council: e.target.value })}>
          <option value="">Choose one</option>
          {spec.groups.map((g) => <optgroup key={g.label} label={g.label}>{g.options.map((c) => <option key={c}>{c}</option>)}</optgroup>)}
        </select>
      </Field>
      <Field text={spec.numberLabel} req={p.council !== OTHER_COUNCIL} optional={p.council === OTHER_COUNCIL} error={err.registrationNo}>
        <input className={`${field(err.registrationNo)} uppercase`} value={p.registrationNo} onChange={(e) => set({ registrationNo: e.target.value.toUpperCase() })} placeholder={spec.placeholder} autoCapitalize="characters" />
      </Field>
      <p className="flex gap-2.5 rounded-[14px] bg-good-soft px-4 py-3 text-[13px] leading-relaxed text-good">
        <svg aria-hidden className="mt-0.5 flex-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10M8.5 12l2.5 2.5 4.5-5" /></svg>
        <span>We check it with {spec.checkedWith} within 24–48 hours, then your profile shows the <strong className="font-semibold">Verified</strong> badge.</span>
      </p>
    </div>
  );
}

function ContactStep({ p, set, err }: StepProps) {
  return (
    <div className="grid gap-5">
      <Field text="Mobile number" req error={err.phone}>
        <span className={boxed(err.phone)}>
          <span className="text-[15px] text-muted">+91</span>
          <input className="w-full bg-transparent py-3 text-[15px] font-light outline-none" type="tel" inputMode="numeric" autoComplete="tel-national" value={p.phone} onChange={(e) => set({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit mobile" />
        </span>
      </Field>
      <Field text="Email" optional error={err.email}>
        <input className={field(err.email)} type="email" autoComplete="email" value={p.email} onChange={(e) => set({ email: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <Field text="District" req error={err.district}>
          <select className={field(err.district)} value={p.district} onChange={(e) => set({ district: e.target.value, town: "" })}>
            <option value="">Choose</option>
            {KERALA_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <TownField p={p} set={set} err={err} />
      </div>
    </div>
  );
}

function ExperienceStep({ p, set }: StepProps) {
  const now = new Date().getFullYear();
  const places = p.workplaces;
  const setPlace = (i: number, patch: Partial<MedicoProfile["workplaces"][number]>) => set({ workplaces: places.map((w, j) => (j === i ? { ...w, ...patch } : w)) });
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="How to add your experience">
        {([["years", "Total years", "Quickest"], ["workplaces", "Each workplace", "Families like it"]] as const).map(([mode, title, sub]) => (
          <button key={mode} type="button" role="radio" aria-checked={p.experienceMode === mode} onClick={() => set({ experienceMode: mode })}
            className={`cursor-pointer rounded-[16px] border px-4 py-3 text-left ${p.experienceMode === mode ? "border-navy bg-wash" : "border-line hover:border-navy"}`}>
            <span className="block text-[14px] font-medium">{title}</span>
            <span className="text-[12px] text-muted">{sub}</span>
          </button>
        ))}
      </div>
      {p.experienceMode === "years" ? (
        <div className="grid gap-4">
          <div className="flex items-center justify-center gap-6">
            <button type="button" onClick={() => set({ years: Math.max(0, p.years - 1) })} aria-label="One year less" className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-line text-xl hover:border-navy">−</button>
            <span className="min-w-24 text-center text-[32px] font-light" aria-live="polite">{p.years} <span className="text-[15px] text-muted">{p.years === 1 ? "year" : "years"}</span></span>
            <button type="button" onClick={() => set({ years: Math.min(YEARS_MAX, p.years + 1) })} aria-label="One year more" className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-line text-xl hover:border-navy">+</button>
          </div>
          <input type="range" min={0} max={YEARS_MAX} value={p.years} onChange={(e) => set({ years: Number(e.target.value) })} aria-label="Years of experience" className="accent-navy" />
        </div>
      ) : (
        <div className="grid gap-3">
          {places.map((w, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 rounded-[16px] border border-line p-3.5">
              <label className={`${label} col-span-2`}>Hospital or clinic<input className={input} value={w.place} onChange={(e) => setPlace(i, { place: e.target.value })} /></label>
              <label className={`${label} col-span-2`}>Your role<input className={input} value={w.role} onChange={(e) => setPlace(i, { role: e.target.value })} placeholder="E.g. Staff Nurse" /></label>
              <label className={label}>From<input className={input} inputMode="numeric" maxLength={4} value={w.from} onChange={(e) => setPlace(i, { from: e.target.value.replace(/\D/g, "") })} placeholder={String(now - 5)} /></label>
              <label className={label}>To
                <input className={input} inputMode="numeric" maxLength={4} disabled={w.to === "Present"} value={w.to === "Present" ? "" : w.to} onChange={(e) => setPlace(i, { to: e.target.value.replace(/\D/g, "") })} placeholder={w.to === "Present" ? "Present" : String(now)} />
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-[13px]"><input type="checkbox" checked={w.to === "Present"} onChange={(e) => setPlace(i, { to: e.target.checked ? "Present" : "" })} className="size-4 accent-navy" />I work here now</label>
              <button type="button" onClick={() => set({ workplaces: places.filter((_, j) => j !== i) })} className="cursor-pointer justify-self-end text-[13px] text-muted underline hover:text-bad">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => set({ workplaces: [...places, { place: "", role: "", from: "", to: "" }] })} className="cursor-pointer rounded-[16px] border border-dashed border-line py-3 text-[14px] text-navy hover:border-navy">+ Add workplace</button>
          <p className="text-[14px]">Total: <strong className="font-semibold">{totalYears(p)} years</strong></p>
        </div>
      )}
    </div>
  );
}

function AwardsStep({ p, set }: StepProps) {
  const setAward = (i: number, patch: Partial<MedicoProfile["awards"][number]>) => set({ awards: p.awards.map((a, j) => (j === i ? { ...a, ...patch } : a)) });
  return (
    <div className="grid gap-3">
      {p.awards.map((a, i) => (
        <div key={i} className="grid grid-cols-[minmax(0,1fr)_96px] gap-3 rounded-[16px] border border-line p-3.5 sm:grid-cols-[1fr_1fr_110px]">
          <label className={`${label} col-span-2 sm:col-span-1`}>Award<input className={input} value={a.title} onChange={(e) => setAward(i, { title: e.target.value })} placeholder="E.g. Best Nurse Award" /></label>
          <label className={label}>Awarded by<input className={input} value={a.by} onChange={(e) => setAward(i, { by: e.target.value })} placeholder="E.g. Govt. Medical College" /></label>
          <label className={label}>Year<input className={input} inputMode="numeric" maxLength={4} value={a.year} onChange={(e) => setAward(i, { year: e.target.value.replace(/\D/g, "") })} /></label>
          <button type="button" onClick={() => set({ awards: p.awards.filter((_, j) => j !== i) })} className="col-span-2 cursor-pointer justify-self-end text-[13px] text-muted underline hover:text-bad sm:col-span-3">Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => set({ awards: [...p.awards, { title: "", by: "", year: "" }] })} className="cursor-pointer rounded-[16px] border border-dashed border-line py-3 text-[14px] text-navy hover:border-navy">+ Add an award</button>
      {p.awards.length === 0 && <p className="text-[13px] text-muted">Hospital awards, COVID or flood-duty certificates, research papers and prizes all count.</p>}
    </div>
  );
}

const OTHER_TOWN = "__other";

/** The district's towns, with "Other" for a town that is not on the list. */
function TownField({ p, set }: StepProps) {
  const towns = townsIn(p.district);
  const [typing, setTyping] = useState(!!p.town && !towns.includes(p.town));
  return (
    <div className="grid gap-2">
      <Field text="Town" optional>
        <select className={input} disabled={!p.district} value={typing ? OTHER_TOWN : p.town}
          onChange={(e) => {
            const other = e.target.value === OTHER_TOWN;
            setTyping(other);
            set({ town: other ? "" : e.target.value });
          }}>
          <option value="">{p.district ? "Choose" : "District first"}</option>
          {towns.map((t) => <option key={t}>{t}</option>)}
          {p.district && <option value={OTHER_TOWN}>Other (type it in)</option>}
        </select>
      </Field>
      {typing && <input className={input} aria-label="Your town" value={p.town} onChange={(e) => set({ town: e.target.value })} placeholder="Your town or village" maxLength={80} autoFocus />}
    </div>
  );
}

const WORKWEEK: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

/** A day or hour toggle that fills its grid cell, so rows line up on phones. */
function Slot({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`cursor-pointer rounded-full border px-1 py-2 text-center text-[13px] whitespace-nowrap transition-colors sm:px-4 sm:text-[14px] ${on ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}>
      {children}
    </button>
  );
}

/** A small text button for "select all" style shortcuts. */
function Quick({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className="cursor-pointer text-[13px] text-navy underline underline-offset-2 hover:text-navy-soft">{children}</button>;
}

function AvailabilityStep({ p, set, err }: StepProps) {
  // Pick days, then hours: the same hours apply to every day picked.
  const [days, setDays] = useState<Weekday[]>(() => WEEKDAYS.filter((d) => p.weekly[d]?.length));
  const [hours, setHours] = useState<string[]>(() => p.weekly[WEEKDAYS.find((d) => p.weekly[d]?.length) ?? "Mon"] ?? []);
  const save = (d: Weekday[], h: string[]) => {
    setDays(d);
    setHours(h);
    set({ weekly: Object.fromEntries(d.map((day) => [day, inDayOrder(h)])) });
  };
  const summary = timetableSummary(p);
  return (
    <div className="grid gap-7">
      <section className="grid gap-5" data-invalid={err.weekly ? "" : undefined}>
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[16px] border border-line px-4 py-3">
          <span className="text-[14px]">Available 24×7, every day<span className="block text-[12px] text-muted">For live-in care, night shifts and ambulances</span></span>
          <Switch checked={p.allDay} onChange={(allDay) => set({ allDay })} />
        </label>

        {!p.allDay && (
          <>
            <fieldset className="grid gap-2">
              <legend className="mb-1.5 flex w-full items-center justify-between gap-3 text-[13px] text-body">
                <span>Days you work<span aria-hidden className="text-bad"> *</span></span>
                <span className="flex gap-3"><Quick onClick={() => save(WORKWEEK, hours)}>Mon–Fri</Quick><Quick onClick={() => save([...WEEKDAYS], hours)}>Every day</Quick></span>
              </legend>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {WEEKDAYS.map((d) => <Slot key={d} on={days.includes(d)} onClick={() => save(WEEKDAYS.filter((x) => (x === d ? !days.includes(d) : days.includes(x))), hours)}>{d}</Slot>)}
              </div>
            </fieldset>

            <fieldset className="grid gap-2">
              <legend className="mb-1.5 flex w-full items-center justify-between gap-3 text-[13px] text-body">
                <span>Hours you are free<span aria-hidden className="text-bad"> *</span></span>
                <span className="flex gap-3"><Quick onClick={() => save(days, SLOT_TIMES)}>All</Quick>{hours.length > 0 && <Quick onClick={() => save(days, [])}>Clear</Quick>}</span>
              </legend>
              <div className="grid gap-2.5">
                {DAY_PARTS.map((part) => (
                  <div key={part.label} className="grid gap-1.5 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:items-center">
                    <span className="text-[12px] text-muted">{part.label}</span>
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {part.times.map((t) => <Slot key={t} on={hours.includes(t)} onClick={() => save(days, toggle(hours, t))}>{shortTime(t)}</Slot>)}
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {err.weekly ? <Err msg={err.weekly} /> : (
          <p aria-live="polite" className={`rounded-[14px] px-4 py-3 text-[13px] ${summary.length ? "bg-good-soft text-good" : "bg-wash text-muted"}`}>
            {summary.length
              ? <>Families can book you <strong className="font-semibold">{summary.join("; ")}</strong>{!p.allDay && ` · ${weeklySlotCount(p)} slots a week`}</>
              : days.length && !hours.length ? "Now pick the hours you are free." : hours.length ? "Now pick the days you work." : "Each hour you pick is a one-hour booking slot."}
          </p>
        )}
      </section>

      <fieldset className="grid gap-2" data-invalid={err.languages ? "" : undefined}>
        <legend className="mb-1.5 text-[13px] text-body">Languages you speak<span aria-hidden className="text-bad"> *</span></legend>
        <div className="flex flex-wrap gap-2">{MEDICO_LANGUAGES.map((l) => <Chip key={l} on={p.languages.includes(l)} onClick={() => set({ languages: toggle(p.languages, l) })}>{l}</Chip>)}</div>
        {p.languages.includes("Other") && (
          <input className={`${input} mt-1`} aria-label="Other languages" value={p.otherLanguages} onChange={(e) => set({ otherLanguages: e.target.value })}
            placeholder="Please specify, e.g. Kannada, Tulu" maxLength={120} autoFocus />
        )}
        <Err msg={err.languages} />
      </fieldset>
    </div>
  );
}

type Suggested = { unit: string; services: MedicoService[]; online?: boolean };

/** Services and charges, started from the profession's usual services. Every row can be changed or removed. */
function ServicesStep({ p, set, err, onEdit }: StepProps & { onEdit: (step: number) => void }) {
  const [suggested, setSuggested] = useState<Suggested | null>(null);
  const [failed, setFailed] = useState(false);
  const filled = useRef(p.services.length > 0);

  useEffect(() => {
    if (!p.role) return;
    let live = true;
    api<Suggested>(`/medico/services?role=${encodeURIComponent(p.role)}`)
      .then((r) => {
        if (!live) return;
        setSuggested(r);
        // Fill in the suggestions once, the first time this step opens with no services.
        if (!filled.current && r.services.length) {
          filled.current = true;
          set({ services: r.services });
        }
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.role]);

  const edit = (i: number, patch: Partial<MedicoService>) => set({ services: p.services.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const missing = suggested?.services.filter((x) => !p.services.some((y) => y.name === x.name)) ?? [];
  const unit = suggested?.unit ?? "visit";
  const canOnline = canConsultOnline(MEDICO_CATEGORY[p.role] ?? "");

  if (!p.role) {
    return <p className="rounded-[14px] bg-wash px-4 py-3 text-[14px] text-body">Choose your role in step 1 and we will suggest your services and charges. <button type="button" onClick={() => onEdit(0)} className="cursor-pointer text-navy underline">Choose it now</button></p>;
  }
  return (
    <div className="grid gap-4">
      {failed && !p.services.length && <p className="text-[13px] text-muted">Suggestions could not load. Add your services below.</p>}
      <ul className="grid gap-3">
        {p.services.map((x, i) => (
          <li key={i} className="grid gap-3 rounded-[16px] border border-line p-3.5">
            <div className="grid gap-1.5" data-invalid={err[`name${i}`] ? "" : undefined}>
              <div className="flex items-center gap-1">
                <input aria-label="Service name" className={`${field(err[`name${i}`])} font-normal`} value={x.name} onChange={(e) => edit(i, { name: e.target.value })} maxLength={80} placeholder="Service name, e.g. Home visit" />
                <button type="button" onClick={() => set({ services: p.services.filter((_, j) => j !== i) })} aria-label={`Remove ${x.name || "service"}`}
                  className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-full text-muted hover:bg-bad-soft hover:text-bad">
                  <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
                </button>
              </div>
              <Err msg={err[`name${i}`]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field text={`Charge / ${x.online ? "consult" : unit}`} req error={err[`price${i}`]}>
                <span className={boxed(err[`price${i}`])}>
                  <span className="text-[15px] text-muted">₹</span>
                  <input className="w-full min-w-0 bg-transparent py-3 text-[15px] font-light outline-none" inputMode="numeric" value={x.price || ""} onChange={(e) => edit(i, { price: Number(e.target.value.replace(/\D/g, "").slice(0, 6)) || 0 })} placeholder="500" />
                </span>
              </Field>
              <Field text="Duration" optional>
                <input className={input} value={x.duration} onChange={(e) => edit(i, { duration: e.target.value })} maxLength={30} placeholder="30 min" />
              </Field>
            </div>
            {canOnline && (
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[12px] bg-wash px-3.5 py-2.5 text-[13px]">
                <span className="flex items-center gap-2">
                  <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.6" strokeLinejoin="round"><path d="M15 10l5-3v10l-5-3M3 6h12v12H3z" /></svg>
                  Online, by video call
                </span>
                <Switch checked={!!x.online} onChange={(online) => edit(i, { online })} />
              </label>
            )}
          </li>
        ))}
      </ul>
      {p.services.length < MAX_SERVICES && (
        <button type="button" onClick={() => set({ services: [...p.services, { name: "", price: 0, duration: "", online: false }] })} className="cursor-pointer rounded-[16px] border border-dashed border-line py-3 text-[14px] text-navy hover:border-navy">+ Add a service</button>
      )}
      {missing.length > 0 && (
        <div className="grid gap-2">
          <span className="text-[12px] text-muted">Suggested for {p.role.toLowerCase()}s</span>
          <div className="flex flex-wrap gap-2">
            {missing.map((x) => <button key={x.name} type="button" onClick={() => set({ services: [...p.services, x] })} className="cursor-pointer rounded-full border border-dashed border-line px-3.5 py-2 text-[13px] text-navy hover:border-navy">+ {x.name}</button>)}
          </div>
        </div>
      )}
      <span data-invalid={err.services ? "" : undefined}><Err msg={err.services} /></span>
      <p className="text-[12px] text-muted">Families see these charges. You receive each charge less our 12% platform commission.</p>
    </div>
  );
}

function ReviewStep({ p, set, err, onEdit, missing, live }: StepProps & { onEdit: (step: number) => void; missing: (step: number) => boolean; live: boolean }) {
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
  const services = p.services.filter((x) => x.name && x.price > 0);
  const rows: [string, string, number][] = [
    ["Personal details", [displayName(p), [p.role, p.specialisation].filter(Boolean).join(" · "), p.qualification].filter(Boolean).join(" · "), 0],
    ["Photo", p.photoUrl ? "Added" : "", 1],
    ["Registration", [p.council, p.registrationNo].filter(Boolean).join(" · "), 2],
    ["Contact & area", [/^\d{10}$/.test(p.phone) ? `+91 ${p.phone}` : "", p.district && medicoPlace(p)].filter(Boolean).join(" · "), 3],
    ["Experience", totalYears(p) ? `${totalYears(p)} years` : "", 4],
    ["Awards", p.awards.filter((a) => a.title).map((a) => a.title).join(", "), 5],
    ["Availability", [timetableSummary(p).join("; "), spokenLanguages(p).join(", ")].filter(Boolean).join(" · "), 6],
    ["Services & charges", services.length ? `${services.length} service${services.length === 1 ? "" : "s"} · from ₹${Math.min(...services.map((x) => x.price))}` : "", 7],
  ];
  const gaps = rows.filter(([, , s]) => missing(s));
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 gap-2">
        <Field text="Profile bio" req error={err.bio}>
          <textarea rows={5} maxLength={BIO_MAX} className={`${field(err.bio)} leading-relaxed`} value={p.bio} onChange={(e) => set({ bio: e.target.value })} placeholder="2–3 sentences about your experience and how you care for patients." />
        </Field>
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={write} disabled={busy} className={`${small} flex items-center gap-1.5 disabled:opacity-60`}>
            <span aria-hidden className="text-[#3B6FD8]">✦</span>{busy ? "Writing…" : p.bio ? "Rewrite with AI" : "Write with AI"}
          </button>
          <span className="text-[12px] text-faint">{p.bio.length} / {BIO_MAX}</span>
        </div>
        <p className="text-[12px] text-muted">{note || "The AI uses only the details you entered, never your phone or email."}</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <h2 className="text-[15px] font-medium">Your details</h2>
        <ul className="divide-y divide-line-soft rounded-[16px] border border-line">
          {rows.map(([k, v, s]) => {
            const gap = missing(s);
            return (
              <li key={k} className="flex items-center gap-3 px-4 py-3">
                <span aria-hidden className={`flex size-6 flex-none items-center justify-center rounded-full text-[12px] ${gap ? "bg-bad-soft text-bad" : v ? "bg-good-soft text-good" : "bg-wash text-faint"}`}>{gap ? "!" : v ? "✓" : "–"}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium">{k}</span>
                  <span className={`block truncate text-[12px] ${gap ? "text-bad" : v ? "text-muted" : "text-faint"}`}>{gap ? "Needs your attention" : v || "Not added"}</span>
                </span>
                <button type="button" onClick={() => onEdit(s)} className="flex-none cursor-pointer px-1 py-2 text-[13px] text-navy underline">{gap ? "Fix" : "Edit"}</button>
              </li>
            );
          })}
        </ul>
      </div>

      {gaps.length ? (
        <p className="rounded-[14px] bg-bad-soft px-4 py-3 text-[13px] text-bad">Complete {gaps.map(([k]) => k.toLowerCase()).join(", ")} to {live ? "save" : "submit"}.</p>
      ) : !live && (
        <p className="flex items-start gap-2.5 rounded-[14px] bg-good-soft px-4 py-3 text-[13px] leading-relaxed text-good">
          <svg aria-hidden className="mt-0.5 flex-none" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.2-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7Z" /></svg>
          All set! Our team reviews and verifies new profiles within 24–48 hours.
        </p>
      )}
    </div>
  );
}

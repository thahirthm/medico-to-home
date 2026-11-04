"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { getMe, isMedico, setMode, staffLogIn, supabase, type Me } from "@/lib/api";
import { field, Loading } from "./ui";

type Area = "admin" | "professional";
// Admin 2-step code. NEXT_PUBLIC_ADMIN_TWO_STEP=off skips it for local testing only; it must match the API's ADMIN_TWO_STEP.
const TWO_STEP = process.env.NEXT_PUBLIC_ADMIN_TWO_STEP !== "off";
type State = "loading" | "login" | "two-step" | "denied" | "ok";

const MeContext = createContext<Me | null>(null);
/** The signed-in account inside a gated area. */
export const useMe = () => useContext(MeContext)!;

/**
 * Professional mode: signed in on the Medico login page, open once the Medico registration is sent (it shows the checks until approved).
 * Admin: invited staff only, email + password and then a 2-step code from an authenticator app.
 */
export function AuthGate({ area, children }: { area: Area; children: ReactNode }) {
  const [state, setState] = useState<State>("loading");
  const [me, setMe] = useState<Me | null>(null);
  const router = useRouter();

  const check = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    // Medicos sign in on the Medico login page, and finish registration before professional mode opens.
    if (!data.session) return area === "professional" ? router.replace("/medico") : setState("login");
    if (area === "admin" && TWO_STEP) {
      const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (level?.currentLevel !== "aal2") return setState("two-step");
    }
    const found = await getMe().catch(() => null);
    if (!found) return area === "professional" ? router.replace("/medico") : setState("login");
    setMe(found);
    if (area === "admin") return setState(found.staff ? "ok" : "denied");
    if (!isMedico(found)) return router.replace("/medico/register");
    if (found.last_mode !== "professional") setMode("professional").catch(() => {});
    setState("ok");
  }, [area, router]);

  useEffect(() => {
    // Runs once on mount; `check` only reads the session, so a late result is harmless.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    check();
  }, [check]);

  if (state === "ok") return <MeContext.Provider value={me}>{children}</MeContext.Provider>;
  if (state === "loading") return <Loading />;

  const leave = () => supabase.auth.signOut({ scope: "local" }).then(() => setState("login"));

  return (
    <div className="flex min-h-dvh items-center justify-center bg-wash p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6">
        <Image src="/brand/logo.svg" alt="Medico To Home" width={132} height={32} className="mb-5 h-7 w-auto" unoptimized />
        {state === "login" && area === "admin" && <StaffLogin onDone={check} />}
        {state === "two-step" && <TwoStep onDone={check} onCancel={leave} />}
        {state === "denied" && (
          <>
            <p className="text-sm text-body">This account does not have access to the admin dashboard.</p>
            <button onClick={leave} className="mt-4 cursor-pointer text-sm underline">Use a different account</button>
          </>
        )}
      </div>
    </div>
  );
}

function StaffLogin({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await staffLogIn(email, password);
      setPassword("");
      onDone();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <h1 className="text-xl font-medium">Staff sign in</h1>
      <p className="text-[13px] text-muted">Invited staff only.</p>
      <input className={field} type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" />
      <input className={field} type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" aria-label="Password" />
      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
      <button className="w-full cursor-pointer rounded-full bg-navy px-4 py-3 text-sm font-normal text-white hover:bg-navy-soft">Continue</button>
    </form>
  );
}

/** Asks for the authenticator code; on the first sign-in it sets the authenticator up with a QR code. */
function TwoStep({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [factorId, setFactorId] = useState("");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      const { data, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) return live && setError("Could not load your 2-step settings. Please sign in again.");
      const verified = data.totp[0];
      if (verified) return live && setFactorId(verified.id);
      // A half-finished setup from an earlier visit blocks a new one, so clear it first.
      for (const f of data.all.filter((x) => x.status === "unverified")) await supabase.auth.mfa.unenroll({ factorId: f.id });
      // Names must be unique per user, and React may run this twice at once in development, so each attempt gets its own.
      const enrolled = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Medico To Home admin ${Date.now().toString(36)}` });
      if (!live) return;
      if (enrolled.error) return setError("Could not start 2-step setup. Please try again.");
      setFactorId(enrolled.data.id);
      setQr(enrolled.data.totp.qr_code);
      setSecret(enrolled.data.totp.secret);
    })();
    return () => {
      live = false;
    };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !factorId) return;
    setBusy(true);
    setError("");
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setBusy(false);
    if (verifyError) return setError("That code is not correct. Codes change every 30 seconds.");
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <h1 className="text-xl font-medium">2-step code</h1>
      {qr ? (
        <>
          <p className="text-sm text-body">First time here: scan this with an authenticator app (Google Authenticator, Microsoft Authenticator or 1Password), then enter the 6-digit code it shows.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR code for your authenticator app" className="mx-auto size-44" />
          <p className="break-all text-center text-[12px] text-muted">Or enter this key: {secret}</p>
        </>
      ) : (
        <p className="text-sm text-body">Enter the 6-digit code from your authenticator app.</p>
      )}
      <input className={`${field} text-center text-xl tracking-[.4em]`} inputMode="numeric" autoComplete="one-time-code" autoFocus required pattern="\d{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} aria-label="6-digit code" />
      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
      <button disabled={busy || code.length !== 6 || !factorId} className="w-full cursor-pointer rounded-full bg-navy px-4 py-3 text-sm font-normal text-white hover:bg-navy-soft disabled:opacity-60">{busy ? "Checking…" : "Verify"}</button>
      <button type="button" onClick={onCancel} className="w-full cursor-pointer text-sm text-muted underline">Use a different account</button>
    </form>
  );
}

export const signOut = () => supabase.auth.signOut({ scope: "local" }).then(() => window.location.reload());

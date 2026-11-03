"use client";

import { useState, type FormEvent } from "react";
import { sendEmailCode, signInWithGoogle, verifyEmailCode } from "@/lib/api";
import { GoogleButton, OrDivider } from "./GoogleButton";

// Google only for now. Set to true to bring back the emailed 6-digit code (needs the Supabase email template and SMTP).
const EMAIL_SIGN_IN = false;

const input ="w-full rounded-xl border border-line bg-white px-4 py-3.5 text-base font-light text-navy outline-none focus:border-navy";
const primary = "w-full cursor-pointer rounded-full bg-navy px-4 py-3.5 text-[15px] font-semibold text-white hover:bg-navy-soft disabled:cursor-default disabled:opacity-60";

/**
 * Sign in or sign up with Google, or with an emailed 6-digit code (the same email also carries a magic link).
 * `beforeLeave` runs before Google or the magic link can take the user away, so the caller can save what they were doing.
 */
export function SignInFlow({ onSignedIn, beforeLeave, title = "Log in or sign up", redirectPath, footer = "No password needed. New here? This creates your account." }: { onSignedIn: () => void; beforeLeave?: () => void; title?: string; redirectPath?: string; footer?: string }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const returnTo = () => (redirectPath ? window.location.origin + redirectPath : window.location.href.split("#")[0]);

  const google = async () => {
    beforeLeave?.();
    setGoogleBusy(true);
    setError("");
    try {
      await signInWithGoogle(returnTo());
    } catch (err) {
      setGoogleBusy(false);
      setError((err as Error).message);
    }
  };

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      beforeLeave?.();
      await sendEmailCode(email, returnTo());
      setStep("code");
      setCode("");
      setNote(e ? "" : "A new code is on its way.");
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  };

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await verifyEmailCode(email, code);
      onSignedIn();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  if (step === "code") {
    return (
      <form onSubmit={verify} className="flex flex-col gap-3.5">
        <h2 className="text-[28px] font-light tracking-tight">
          Check your <span className="font-semibold">email</span>
        </h2>
        <p className="text-[15px] leading-relaxed text-body">
          We sent a 6-digit code to <span className="font-medium text-navy">{email}</span>. Enter it here, or tap the link in the email.
        </p>
        <input
          className={`${input} text-center text-2xl tracking-[.4em]`}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          required
          pattern="\d{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          aria-label="6-digit code"
          placeholder="••••••"
        />
        {error && <p role="alert" className="text-sm text-bad">{error}</p>}
        {note && !error && <p className="text-sm text-good">{note}</p>}
        <button className={primary} disabled={busy || code.length !== 6}>{busy ? "Please wait…" : "Continue"}</button>
        <div className="flex justify-between text-[13px]">
          <button type="button" onClick={() => { setStep("email"); setError(""); }} className="cursor-pointer text-navy underline">Change email</button>
          <button type="button" onClick={() => send()} disabled={busy} className="cursor-pointer text-navy underline">Send a new code</button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={send} className="flex flex-col gap-3.5">
      <h2 className="text-[28px] font-light tracking-tight">{title}</h2>
      <GoogleButton onClick={google} busy={googleBusy} />
      {EMAIL_SIGN_IN && (
        <>
          <OrDivider />
          <input className={input} type="email" required autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="Email address" aria-label="Email address" />
        </>
      )}
      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
      {EMAIL_SIGN_IN && <button className={primary} disabled={busy}>{busy ? "Sending code…" : "Continue with email"}</button>}
      <p className="text-center text-[13px] text-muted">{footer}</p>
    </form>
  );
}

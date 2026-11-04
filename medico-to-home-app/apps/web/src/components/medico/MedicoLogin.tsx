"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { getMe, isMedico, signInWithGoogle, supabase } from "@/lib/api";
import { BenefitsSlider } from "./BenefitsSlider";

// Phone + OTP needs an SMS provider (MSG91 or Twilio) set up in Supabase. Turn on once it is.
const PHONE_SIGN_IN = false;

/** Sign-in for Medicos. Signing in creates the account; a new Medico goes straight to registration. */
export function MedicoLogin() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");

  // Medicos with a sent registration open their dashboard; everyone else continues their registration.
  useEffect(() => {
    let live = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!live) return;
      if (!data.session) return setChecking(false);
      const me = await getMe().catch(() => null);
      if (!live) return;
      if (!me) return setChecking(false);
      router.replace(isMedico(me) ? "/pro" : "/medico/register");
    });
    return () => {
      live = false;
    };
  }, [router]);

  const google = async () => {
    setBusy(true);
    setError("");
    try {
      await signInWithGoogle(`${window.location.origin}/medico`);
    } catch (err) {
      setBusy(false);
      setError((err as Error).message);
    }
  };

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:order-2 lg:px-16">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
          <Link href="/" aria-label="Medico To Home home">
            <Image src="/brand/logo.svg" alt="Medico To Home" width={150} height={36} className="h-8 w-auto" unoptimized priority />
          </Link>
          <div className="grid grid-cols-2 rounded-full bg-[#F5F6FA] p-1 text-[14px]" role="tablist" aria-label="Who is signing in">
            <Link href="/?login=patient" role="tab" aria-selected={false} className="rounded-full py-2.5 text-center text-muted hover:text-navy">Patient</Link>
            <span role="tab" aria-selected className="rounded-full bg-white py-2.5 text-center font-medium text-navy shadow-sm">Medico</span>
          </div>
          <div>
            <h1 className="text-[32px] font-light tracking-[-.03em]">
              Medico <span className="font-semibold">login</span>
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-body">For doctors, nurses, therapists, caretakers and lab technicians. New here? Signing in creates your account.</p>
          </div>
          {checking ? (
            <p className="py-6 text-center text-sm text-muted">Checking your sign-in…</p>
          ) : (
            <div className="flex flex-col gap-3.5">
              <GoogleButton onClick={google} busy={busy} />
              {PHONE_SIGN_IN && (
                <>
                  <div className="flex items-center gap-3 text-[13px] text-muted" role="separator"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
                  <label className="flex items-center gap-2 rounded-[14px] border border-line px-4 focus-within:border-navy">
                    <span className="text-[15px] text-muted">+91</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel-national" placeholder="Mobile number" aria-label="Mobile number" className="w-full bg-transparent py-3.5 text-base font-light outline-none" />
                  </label>
                  <button disabled className="w-full rounded-full bg-navy px-4 py-3.5 text-[15px] font-semibold text-white opacity-60">Continue with phone</button>
                </>
              )}
              {error && <p role="alert" className="text-sm text-bad">{error}</p>}
            </div>
          )}
          <p className="text-[13px] leading-relaxed text-muted">
            By continuing you agree to our <Link href="/legal/terms" className="text-navy underline">Terms</Link> and <Link href="/legal/privacy" className="text-navy underline">Privacy policy</Link>.
          </p>
        </div>
      </div>
      <div className="lg:order-1">
        <BenefitsSlider />
      </div>
    </main>
  );
}

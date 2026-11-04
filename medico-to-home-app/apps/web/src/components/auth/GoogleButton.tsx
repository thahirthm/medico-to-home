"use client";

import { useEffect, useRef, useState } from "react";
import { GOOGLE_CLIENT_ID, signInWithGoogleToken } from "@/lib/api";

interface GoogleId {
  initialize(options: Record<string, unknown>): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

// Google's sign-in script, loaded once and only on pages that show the button.
let gsi: Promise<GoogleId> | null = null;
const loadGoogle = () =>
  (gsi ??= new Promise<GoogleId>((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve(window.google.accounts.id);
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => (window.google?.accounts?.id ? resolve(window.google.accounts.id) : reject(new Error("Google sign-in did not load.")));
    script.onerror = () => {
      gsi = null;
      reject(new Error("Google sign-in could not load. Please check your connection and try again."));
    };
    document.head.appendChild(script);
  }));

const sha256 = async (text: string) =>
  [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)))].map((b) => b.toString(16).padStart(2, "0")).join("");

export function GoogleButton({ onClick, busy = false }: { onClick: () => void; busy?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-line bg-white px-4 text-[15px] font-medium text-navy transition-colors hover:border-navy disabled:cursor-default disabled:opacity-60"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
      {busy ? "Opening Google…" : "Continue with Google"}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-[13px] text-muted" role="separator">
      <span className="h-px flex-1 bg-line" />
      or
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/**
 * "Continue with Google". With a Google client ID, Google's own button signs in right here in a popup, so Google
 * names this website rather than Supabase, and nothing leaves the page. Without one it falls back to the redirect.
 */
export function GoogleSignIn({ onSignedIn, onError, fallback, fallbackBusy = false }: { onSignedIn: () => void; onError: (message: string) => void; fallback: () => void; fallbackBusy?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onSignedIn, onError });
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    handlers.current = { onSignedIn, onError };
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let live = true;
    (async () => {
      const id = await loadGoogle();
      // Google signs a hash of this one-time value into its token; Supabase checks it against the original.
      const nonce = crypto.randomUUID() + crypto.randomUUID();
      const hashed = await sha256(nonce);
      if (!live || !box.current) return;
      id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        nonce: hashed,
        ux_mode: "popup",
        auto_select: false,
        use_fedcm_for_button: true,
        callback: async ({ credential }: { credential: string }) => {
          setBusy(true);
          try {
            await signInWithGoogleToken(credential, nonce);
            handlers.current.onSignedIn();
          } catch (e) {
            setBusy(false);
            handlers.current.onError((e as Error).message);
          }
        },
      });
      id.renderButton(box.current, { type: "standard", theme: "outline", size: "large", shape: "pill", text: "continue_with", logo_alignment: "center", width: Math.min(400, Math.max(240, box.current.offsetWidth)) });
      setReady(true);
    })().catch((e: Error) => live && handlers.current.onError(e.message));
    return () => {
      live = false;
    };
  }, []);

  if (!GOOGLE_CLIENT_ID) return <GoogleButton onClick={fallback} busy={fallbackBusy} />;
  return (
    <div className="relative w-full">
      <div ref={box} className={`flex min-h-11 w-full justify-center ${ready && !busy ? "" : "invisible"}`} />
      {(!ready || busy) && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full border border-line bg-white text-[15px] font-medium text-navy">
          {busy ? "Signing you in…" : "Loading Google…"}
        </div>
      )}
    </div>
  );
}

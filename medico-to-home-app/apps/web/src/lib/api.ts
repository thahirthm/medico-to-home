/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);

export async function api<T = any>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(API_URL + path, {
    method: options.method ?? (options.body === undefined ? "GET" : "POST"),
    headers: {
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "Something went wrong. Please try again.");
  return json as T;
}

/** Emails a 6-digit code, plus a magic link that signs in on `returnTo`. Creates the account if it is new. */
export async function sendEmailCode(email: string, returnTo: string) {
  const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true, emailRedirectTo: returnTo } });
  if (error) throw new Error(error.status === 429 ? "Too many codes sent. Please wait a minute and try again." : "We could not send the code. Please check the email address.");
}

export async function verifyEmailCode(email: string, code: string) {
  const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: "email" });
  if (error) throw new Error("That code is not correct or has expired.");
}

/** Sends the browser to Google and back to `returnTo`, where the session is picked up. */
export async function signInWithGoogle(returnTo: string) {
  const settings = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! } })
    .then((r) => r.json())
    .catch(() => null);
  if (!settings?.external?.google) throw new Error("Google sign-in is not set up yet. Please use your email for now.");
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: returnTo } });
  if (error) throw new Error("Google sign-in is not available right now.");
}

/** Staff only: the admin dashboard keeps email + password, followed by a 2-step code. */
export async function staffLogIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error("That email or password is not correct.");
}

export interface Me {
  id: string;
  full_name: string;
  phone: string | null;
  email: string;
  city: string;
  role: "patient" | "professional" | "admin";
  last_mode: "patient" | "professional";
  needs_setup: boolean;
  professional: { id: string; name: string; status: string } | null;
  application: { stage: string; decision_note: string; profession: string } | null;
  staff: boolean;
  two_step: boolean;
  modules: string[];
}

export const getMe = () => api<Me>("/me");

export const setMode = (mode: "patient" | "professional") => api("/me/mode", { method: "PUT", body: { mode } });

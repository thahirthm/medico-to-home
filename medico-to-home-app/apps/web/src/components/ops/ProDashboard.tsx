"use client";

import { displayName, type MedicoProfile } from "@medico/shared";
import Link from "next/link";
import { useState } from "react";
import { MedicoIdCard } from "@/components/medico/MedicoIdCard";
import { ProfileStats } from "@/components/medico/MedicoProfileView";
import { api } from "@/lib/api";
import { useMe } from "./AuthGate";
import { Card, Loading, rupees, StatTile, StatusPill } from "./ui";
import { useApi } from "./useApi";

interface Dashboard {
  name: string;
  role: string;
  photo: string;
  status: "pending" | "live" | "hidden";
  online: boolean;
  rating: number;
  reviews: number;
  locality: string;
  today: { id: string; time: string; patient: string; service: string; locality: string; status: string }[];
  requests: { id: string; when: string; patient: string; service: string; locality: string; fee: number }[];
  week: { visits: number; net: number };
}

const STATUS: Record<string, string> = { scheduled: "New request", accepted: "Accepted", on_the_way: "On the way", arrived: "Arrived", in_session: "In session", completed: "Completed", no_show: "No show" };

const greeting = () => {
  const hour = Number(new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", hourCycle: "h23" }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};

/** Professional mode's home. Approved Medicos run their day here; a sent registration sees its checks. */
export function ProDashboard() {
  return useMe().professional ? <LiveDashboard /> : <PendingDashboard />;
}

interface Registration {
  application: { stage: string; decisionNote: string; submittedAt: string | null; profile: MedicoProfile | null } | null;
}

// The checks a registration goes through, in order.
const CHECKS = [
  { stage: "documents", label: "Documents check", note: "Your photo, qualification and ID" },
  { stage: "council", label: "Council registration", note: "Confirmed with your council (24–48 hours)" },
  { stage: "police", label: "ID and police clearance", note: "A standard check for home visits" },
  { stage: "interview", label: "Short interview", note: "A 15-minute call with our care team" },
];

/** While the registration is checked: where it stands, the Medico ID, and what opens once approved. */
function PendingDashboard() {
  const me = useMe();
  const { data, error } = useApi<Registration>("/medico/profile");
  if (!data) return <Loading error={error} />;
  const app = data.application;
  const p = app?.profile;
  if (!app || !p) return <Loading error="Your registration could not be loaded. Please refresh the page." />;

  const stage = app.stage;
  const current = Math.max(0, CHECKS.findIndex((c) => c.stage === stage));
  const name = displayName(p) || me.full_name;
  const sent = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("sent");

  return (
    <div className="grid gap-5">
      {sent && (
        <div role="status" className="fade-up flex items-center gap-3 rounded-2xl bg-good-soft px-5 py-4 text-[14px] text-good">
          <span aria-hidden className="flex size-7 flex-none items-center justify-center rounded-full bg-good text-white">✓</span>
          <span><strong className="font-medium">Registration sent.</strong> Welcome to Medico To Home. Kerala has one more life-saver on call.</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-light tracking-tight sm:text-3xl">{greeting()}, {name.split(" ").slice(0, name.startsWith("Dr.") ? 2 : 1).join(" ")}</h1>
          <p className="text-sm text-muted">{[p.role, p.specialisation, p.district].filter(Boolean).join(" · ")}</p>
        </div>
        <StatusPill tone={stage === "info_needed" ? "bad" : "warn"}>{stage === "info_needed" ? "Details needed" : "Verification in progress"}</StatusPill>
      </div>

      {stage === "info_needed" && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-warn-soft px-5 py-4 text-[14px] leading-relaxed text-warn">
          <span><strong className="font-medium">We need a few more details.</strong> {app.decisionNote}</span>
          <Link href="/medico/register?edit" className="flex-none rounded-full bg-navy px-4 py-2 text-[13px] text-white hover:bg-navy-soft">Update registration</Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Bookings" value="0" note="Opens after verification" />
        <StatTile label="New requests" value="–" note="Opens after verification" />
        <StatTile label="This week" value={rupees(0)} note="Payouts every Monday" />
        <StatTile label="Rating" value="–" note="No reviews yet" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-4">
          <MedicoIdCard p={p} id={me.id} stage={stage} />
          <ProfileStats p={p} />
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Card title="Your verification">
            <ol className="px-5 py-4">
              <li className="relative flex gap-4 pb-5">
                <span aria-hidden className="absolute top-8 bottom-0 left-[15px] w-px bg-good" />
                <span className="flex size-8 flex-none items-center justify-center rounded-full bg-good text-white">✓</span>
                <div>
                  <div className="text-[15px] font-medium">Registration sent</div>
                  <div className="text-[13px] text-muted">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Received"}</div>
                </div>
              </li>
              {CHECKS.map((c, i) => {
                const done = i < current, now = i === current;
                return (
                  <li key={c.stage} className="relative flex gap-4 pb-5 last:pb-0">
                    {i < CHECKS.length - 1 && <span aria-hidden className={`absolute top-8 bottom-0 left-[15px] w-px ${done ? "bg-good" : "bg-line"}`} />}
                    <span className={`flex size-8 flex-none items-center justify-center rounded-full text-[13px] ${done ? "bg-good text-white" : now ? "bg-navy text-white ring-4 ring-navy/15" : "bg-wash text-muted ring-1 ring-line"}`}>
                      {done ? "✓" : i + 1}
                    </span>
                    <div>
                      <div className={`text-[15px] ${now ? "font-medium" : done ? "" : "text-muted"}`}>{c.label}{now && <span className="ml-2 rounded-full bg-warn-soft px-2 py-0.5 text-[11px] text-warn">In progress</span>}</div>
                      <div className="text-[13px] text-muted">{c.note}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card title="Bookings">
            <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
              <span aria-hidden className="flex size-12 items-center justify-center rounded-full bg-wash text-navy">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
              </span>
              <p className="text-[15px] font-medium">No bookings yet</p>
              <p className="max-w-sm text-[13px] text-muted">Once you are verified, families near {p.district || "you"} can book you. New requests, today&apos;s visits and your earnings will show here.</p>
            </div>
          </Card>

          <Card title="What happens next">
            <ol className="grid gap-3 px-5 py-4 text-[14px] text-body">
              {["We finish the checks above and approve your profile.", "You add your bank details for payouts every Monday.", "You go online and start taking home visits."].map((t, i) => (
                <li key={t} className="flex gap-3"><span className="flex size-6 flex-none items-center justify-center rounded-full bg-navy text-[12px] text-white">{i + 1}</span>{t}</li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** Go online, see today's visits, answer new requests, check this week's earnings. */
function LiveDashboard() {
  const { data, error, reload } = useApi<Dashboard>("/pro/dashboard");
  const [busy, setBusy] = useState("");
  if (!data) return <Loading error={error} />;

  const live = data.status === "live";
  const setOnline = (online: boolean) => {
    setBusy("online");
    api("/pro/online", { method: "PUT", body: { online } }).then(reload).catch((e: Error) => alert(e.message)).finally(() => setBusy(""));
  };
  const accept = (id: string) => {
    setBusy(id);
    api(`/pro/visits/${id}/status`, { body: {} }).then(reload).catch((e: Error) => alert(e.message)).finally(() => setBusy(""));
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {data.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photo} alt="" className="size-14 rounded-full object-cover" />
          ) : (
            <span className="flex size-14 items-center justify-center rounded-full bg-white text-xl font-medium">{data.name.replace(/^Dr\.?\s*/, "")[0]?.toUpperCase()}</span>
          )}
          <div>
            <h1 className="text-[26px] font-light tracking-tight sm:text-3xl">{greeting()}, {data.name.split(" ").slice(0, data.name.startsWith("Dr.") ? 2 : 1).join(" ")}</h1>
            <p className="text-sm text-muted">{data.role} · {data.locality}</p>
          </div>
        </div>
        <StatusPill tone={live ? "good" : "warn"}>{live ? "Profile live" : "Not live yet"}</StatusPill>
      </div>

      {!live && (
        <div role="status" className="rounded-2xl bg-warn-soft px-5 py-4 text-[14px] leading-relaxed text-warn">
          <strong className="font-medium">{data.status === "hidden" ? "Your profile is paused." : "You are approved."}</strong> {data.status === "hidden" ? "Our team has taken your profile off live for now and will contact you." : "Our team is doing a last check of your profile and will make it live soon."} Until it is live, families cannot book you and you cannot go online.
        </div>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <div className="text-[17px] font-medium">{data.online ? "You are online" : "You are offline"}</div>
            <p className="mt-0.5 text-[14px] text-muted">{data.online ? "Families nearby can send you new requests." : "Go online when you are free to take visits."}</p>
          </div>
          <button
            role="switch"
            aria-checked={data.online}
            aria-label="Online"
            disabled={!live || busy === "online"}
            onClick={() => setOnline(!data.online)}
            className={`relative h-8 w-14 flex-none cursor-pointer rounded-full transition-colors disabled:cursor-default disabled:opacity-50 ${data.online ? "bg-good" : "bg-line"}`}
          >
            <span className={`absolute top-1 size-6 rounded-full bg-white shadow transition-[left] ${data.online ? "left-7" : "left-1"}`} />
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Today" value={String(data.today.length)} note={data.today.length === 1 ? "visit" : "visits"} />
        <StatTile label="New requests" value={String(data.requests.length)} note="waiting for you" />
        <StatTile label="This week" value={rupees(data.week.net)} note={`${data.week.visits} completed`} />
        <StatTile label="Rating" value={data.reviews ? data.rating.toFixed(1) : "–"} note={data.reviews ? `${data.reviews} reviews` : "No reviews yet"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="New requests" action={<Link href="/pro/visits" className="text-[13px] underline">All visits</Link>}>
          {data.requests.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">No new requests right now.</p>
          ) : (
            <ul>
              {data.requests.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-3.5 last:border-0">
                  <div className="min-w-0">
                    <div className="truncate text-[15px]">{r.patient} · {r.service}</div>
                    <div className="truncate text-[13px] text-muted">{r.when}{r.locality ? ` · ${r.locality}` : ""} · {rupees(r.fee)}</div>
                  </div>
                  <button onClick={() => accept(r.id)} disabled={busy === r.id} className="flex-none cursor-pointer rounded-full bg-navy px-4 py-2 text-[13px] text-white hover:bg-navy-soft disabled:opacity-50">
                    {busy === r.id ? "…" : "Accept"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Today's schedule" action={<Link href="/pro/schedule" className="text-[13px] underline">Week</Link>}>
          {data.today.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">No visits today.</p>
          ) : (
            <ul>
              {data.today.map((v) => (
                <li key={v.id} className="flex items-center gap-4 border-b border-line-soft px-5 py-3.5 last:border-0">
                  <span className="w-20 flex-none text-[15px] font-medium">{v.time}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px]">{v.patient}</div>
                    <div className="truncate text-[13px] text-muted">{v.service}{v.locality ? ` · ${v.locality}` : ""}</div>
                  </div>
                  <StatusPill tone={v.status === "completed" ? "good" : v.status === "scheduled" ? "warn" : "plain"}>{STATUS[v.status] ?? v.status}</StatusPill>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

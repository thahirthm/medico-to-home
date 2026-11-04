"use client";

import type { MedicoProfile } from "@medico/shared";
import Link from "next/link";
import { MedicoIdCard } from "@/components/medico/MedicoIdCard";
import { ProfileDetails, ProfileStats } from "@/components/medico/MedicoProfileView";
import { useMe } from "./AuthGate";
import { Card, Loading, PageHead, rupees, StatTile, StatusPill } from "./ui";
import { useApi } from "./useApi";

export function ProSchedule() {
  const { data, error } = useApi<{ day: string; date: string; visits: number }[]>("/pro/schedule");
  if (!data) return <Loading error={error} />;
  return (
    <>
      <PageHead title="Schedule" note="Your next 7 days. Setting your own hours arrives before launch." />
      <Card>
        <ul>
          {data.map((d) => (
            <li key={d.day + d.date} className="flex items-center justify-between border-b border-line-soft px-4 py-3.5 last:border-0">
              <span className="text-sm"><span className="font-normal">{d.day}</span> <span className="text-muted">{d.date}</span></span>
              <span className="text-[13px] text-muted">{d.visits ? `${d.visits} ${d.visits === 1 ? "visit" : "visits"}` : "No visits"}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

export function ProEarnings() {
  const { data, error } = useApi<{ visits: number; gross: number; net: number; commissionRate: number }>("/pro/earnings");
  if (!data) return <Loading error={error} />;
  return (
    <>
      <PageHead title="Earnings" note="This week, from completed visits." />
      <StatTile label="This week" value={rupees(data.net)} note={`${data.visits} completed ${data.visits === 1 ? "visit" : "visits"}`} />
      <Card title="How it adds up">
        <dl className="text-sm">
          <div className="flex justify-between border-b border-line-soft px-4 py-3"><dt className="text-muted">Visit fees</dt><dd>{rupees(data.gross)}</dd></div>
          <div className="flex justify-between border-b border-line-soft px-4 py-3"><dt className="text-muted">Commission ({Math.round(data.commissionRate * 100)}%)</dt><dd>− {rupees(data.gross - data.net)}</dd></div>
          <div className="flex justify-between px-4 py-3 font-medium"><dt>You receive</dt><dd>{rupees(data.net)}</dd></div>
        </dl>
      </Card>
    </>
  );
}

/** The Medico's ID card and full profile. Listings set up by staff without a registration show their basic details. */
export function ProProfile() {
  const me = useMe();
  const { data, error } = useApi<{ application: { stage: string; profile: MedicoProfile | null } | null }>("/medico/profile");
  if (!data) return <Loading error={error} />;
  const p = data.application?.profile;
  if (!data.application || !p) return <ListingProfile />;
  const stage = me.professional ? "approved" : data.application.stage;
  return (
    <>
      <PageHead title="Profile" note="Your Medico ID and everything families see.">
        <Link href="/medico/register?edit" className="rounded-full bg-navy px-4 py-2 text-[13px] text-white hover:bg-navy-soft">Edit profile</Link>
      </PageHead>
      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-4 lg:sticky lg:top-20">
          <MedicoIdCard p={p} id={me.id} stage={stage} />
          <ProfileStats p={p} />
        </div>
        <ProfileDetails p={p} />
      </div>
    </>
  );
}

function ListingProfile() {
  const { data, error } = useApi<{ name: string; role: string; qualification: string; locality: string; radius: number; languages: string[]; status: string }>("/pro/me");
  if (!data) return <Loading error={error} />;
  const rows = [["Name", data.name], ["Profession", data.role], ["Qualification", data.qualification], ["Base area", data.locality], ["Service radius", `${data.radius} km`], ["Languages", data.languages.join(", ")]];
  return (
    <>
      <PageHead title="Profile" note="This is what families see." />
      <Card title="Your details" action={<StatusPill tone={data.status === "live" ? "good" : "warn"}>{data.status === "live" ? "Live" : "Not live"}</StatusPill>}>
        <dl className="text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-line-soft px-4 py-3 last:border-0"><dt className="text-muted">{label}</dt><dd className="text-right">{value}</dd></div>
          ))}
        </dl>
      </Card>
    </>
  );
}

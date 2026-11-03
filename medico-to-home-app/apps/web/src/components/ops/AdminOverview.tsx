"use client";

import Link from "next/link";
import { BookingsChart } from "./BookingsChart";
import { BookingBadge } from "./StatusBadges";
import { Card, Loading, PageHead, rupees, StatTile } from "./ui";
import { useApi } from "./useApi";

interface Overview {
  active: number;
  applications: number;
  live: number;
  payoutDue: number;
  days: { day: string; count: number }[];
  latest: { id: string; service_name: string; patient_name: string; professional: string; status: string }[];
  recentApplications: { id: number; name: string; profession: string; district: string }[];
}

export function AdminOverview() {
  const { data, error } = useApi<Overview>("/admin/overview");
  if (!data) return <Loading error={error} />;
  return (
    <>
      <PageHead title="Overview" note="Live from your database." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Bookings this week" value={String(data.days.reduce((n, d) => n + d.count, 0))} note="Last 7 days" />
        <StatTile label="Active bookings" value={String(data.active)} note="With visits under way" />
        <StatTile label="Awaiting verification" value={String(data.applications)} note="Applications open" />
        <StatTile label="Next payout" value={rupees(data.payoutDue)} note="This week, after 12% commission" />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[3fr_2fr]">
        <Card title="Bookings per day">
          <BookingsChart days={data.days} />
        </Card>
        <Card title="Applications to review" action={<Link href="/admin/applications" className="inline-flex min-h-9 items-center text-[13px] text-muted hover:text-navy">View all</Link>}>
          {data.recentApplications.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">No open applications.</p>}
          <ul>
            {data.recentApplications.map((a) => (
              <li key={a.id} className="border-b border-line-soft px-5 py-3 last:border-0">
                <div className="text-sm font-normal">{a.name}</div>
                <div className="text-[13px] text-muted">{a.profession} · {a.district}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="mt-4">
        <Card title="Latest bookings" action={<Link href="/admin/bookings" className="inline-flex min-h-9 items-center text-[13px] text-muted hover:text-navy">View all</Link>}>
          {data.latest.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">No bookings yet.</p>}
          <ul>
            {data.latest.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-3 last:border-0">
                <div className="min-w-0">
                  <div className="text-sm font-normal">{b.service_name}</div>
                  <div className="text-[13px] text-muted">{b.id} · {b.patient_name} · {b.professional}</div>
                </div>
                <BookingBadge status={b.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

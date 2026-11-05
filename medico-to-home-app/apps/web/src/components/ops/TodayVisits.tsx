"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Card, Loading, PageHead, rupees, StatusPill } from "./ui";
import { useApi } from "./useApi";

interface Visit {
  id: string;
  time: string;
  patient: string;
  age: string;
  service: string;
  address: string;
  notes: string;
  fee: number;
  status: string;
  online: boolean;
  bookingId: string;
  records: { conditions: { n: string }[]; allergies: string[]; medications: { n: string; dose: string }[] } | null;
}

const labels: Record<string, string> = { scheduled: "New request", accepted: "Accepted", on_the_way: "On the way", arrived: "Arrived", in_session: "In session", completed: "Completed", no_show: "No show" };
const actions: Record<string, string> = { scheduled: "Accept visit", accepted: "Start travel", on_the_way: "I have arrived", arrived: "Start session", in_session: "Complete visit" };
// An online consultation has no travel: accepting it, then the call, then completing it.
const onlineActions: Record<string, string> = { scheduled: "Accept consultation", accepted: "Start video call", in_session: "Complete consultation" };
const callPage = (bookingId: string) => window.open(`/call/${bookingId}`, "_blank", "noopener");

export function TodayVisits() {
  const { data, error, reload } = useApi<Visit[]>("/pro/visits");
  const [notes, setNotes] = useState<Record<string, string>>({});
  if (!data) return <Loading error={error} />;

  const next = (id: string) => api(`/pro/visits/${id}/status`, { body: { notes: notes[id] ?? "" } }).then(reload).catch((e: Error) => alert(e.message));

  return (
    <>
      <PageHead title="Visits" note={data.length ? `${data.length} ${data.length === 1 ? "visit" : "visits"} in the next 14 days` : "No visits in the next 14 days"} />
      {data.map((v) => {
        const action = (v.online ? onlineActions : actions)[v.status];
        return (
          <Card key={v.id}>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-medium tracking-tight">{v.time}</span>
                <StatusPill tone={v.status === "completed" ? "good" : v.status === "scheduled" ? "warn" : "plain"}>{labels[v.status] ?? v.status}</StatusPill>
              </div>
              <div className="mt-2 text-[15px] font-normal">{v.patient}{v.age ? `, ${v.age}` : ""}</div>
              <div className="text-[13px] text-muted">{v.service} · {rupees(v.fee)}</div>
              {v.online ? (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#EAF3FB] px-2.5 py-1 text-[12px] text-[#1F6FB2]">Online video consultation</div>
              ) : (
                <div className="mt-3 text-[13px] text-ink">{v.address}</div>
              )}
              {v.notes && <div className="mt-1 text-[13px] text-muted">{v.notes}</div>}
              {v.records && (
                <div className="mt-3 rounded-xl bg-wash p-3 text-[13px] text-ink">
                  <div className="font-normal">Shared health record</div>
                  <div className="mt-1">Conditions: {v.records.conditions.map((c) => c.n).join(", ") || "None added"}</div>
                  <div>Allergies: {v.records.allergies.join(", ") || "None added"}</div>
                  <div>Medicines: {v.records.medications.map((m) => `${m.n} ${m.dose}`).join(", ") || "None added"}</div>
                </div>
              )}
              {v.status === "in_session" && (
                <label className="mt-3 block text-[13px] text-muted">
                  Session notes
                  <textarea rows={3} value={notes[v.id] ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [v.id]: e.target.value }))} className="mt-1 block w-full rounded-xl border border-line p-3 text-sm text-navy outline-none focus:border-navy" />
                </label>
              )}
              {v.online && v.status === "in_session" && (
                <button onClick={() => callPage(v.bookingId)} className="mt-4 w-full cursor-pointer rounded-full border border-navy px-4 py-3 text-sm font-normal text-navy hover:bg-wash">Rejoin video call</button>
              )}
              {action && (
                <button
                  onClick={() => {
                    // The call opens in a new tab straight from the click, so the browser does not block it.
                    if (v.online && v.status === "accepted") callPage(v.bookingId);
                    next(v.id);
                  }}
                  className="mt-4 w-full cursor-pointer rounded-full bg-navy px-4 py-3 text-sm font-normal text-white hover:bg-navy-soft"
                >{action}</button>
              )}
            </div>
          </Card>
        );
      })}
    </>
  );
}

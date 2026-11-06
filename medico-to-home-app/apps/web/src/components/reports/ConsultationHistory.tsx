"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Consultation {
  id: string;
  date: string;
  patient: string;
  service: string;
  online: boolean;
  professional: string;
  photo: string;
  role: string;
  title: string;
  headline: string;
  hasPrescription: boolean;
  next: string;
}

const day = (d: string) => new Date(d).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });

/** The patient's timeline of consultation reports, newest first, for the whole family. */
export function ConsultationHistory() {
  const [list, setList] = useState<Consultation[] | null>(null);
  const [error, setError] = useState("");
  const [who, setWho] = useState("All");

  useEffect(() => { api<Consultation[]>("/consultations").then(setList).catch((e: Error) => setError(e.message)); }, []);

  if (error) return <p className="rounded-xl bg-bad-soft px-4 py-3 text-[14px] text-bad">{error}</p>;
  if (!list) return <p className="py-10 text-center text-[14px] text-muted">Loading your consultations…</p>;
  if (!list.length) {
    return (
      <div className="rounded-[20px] border border-dashed border-line px-6 py-12 text-center">
        <div className="text-[17px]">No consultation reports yet</div>
        <p className="mx-auto mt-1 max-w-sm text-[14px] text-muted">After each visit or video consultation, your professional&apos;s report, prescriptions and follow-up plan appear here.</p>
      </div>
    );
  }
  const people = ["All", ...new Set(list.map((c) => c.patient))];
  const shown = who === "All" ? list : list.filter((c) => c.patient === who);

  return (
    <div className="grid gap-5">
      {people.length > 2 && (
        <div className="flex flex-wrap gap-2">
          {people.map((p) => (
            <button key={p} onClick={() => setWho(p)} className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] ${who === p ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}>{p}</button>
          ))}
        </div>
      )}
      <ol className="relative grid gap-4 border-l border-line pl-6">
        {shown.map((c) => (
          <li key={c.id} className="relative">
            <span className="absolute -left-[31px] top-5 size-3 rounded-full border-2 border-white bg-navy ring-1 ring-line" />
            <Link href={`/consultations/${c.id}`} className="block rounded-[18px] border border-line bg-white p-4 transition-colors hover:border-navy sm:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[12px] text-muted">{day(c.date)} · for {c.patient}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] ${c.online ? "bg-[#EAF3FB] text-[#1F6FB2]" : "bg-wash text-body"}`}>{c.online ? "Video" : "Home visit"}</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="size-11 flex-none rounded-full bg-wash bg-cover bg-center" style={c.photo ? { backgroundImage: `url(${c.photo})` } : undefined} />
                <div className="min-w-0">
                  <div className="truncate text-[16px] font-medium">{c.title}</div>
                  <div className="truncate text-[13px] text-muted">{c.professional} · {c.role}</div>
                </div>
              </div>
              {c.headline && <p className="mt-3 line-clamp-2 text-[14px] text-ink">{c.headline}</p>}
              <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
                {c.hasPrescription && <span className="rounded-full bg-good-soft px-2.5 py-1 text-good">Prescription</span>}
                {c.next && <span className="rounded-full bg-wash px-2.5 py-1 text-body">Next: {day(`${c.next}T00:00:00+05:30`)}</span>}
                <span className="ml-auto text-navy">View report →</span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

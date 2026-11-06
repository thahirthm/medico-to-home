"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ReportDocument, type ReportDoc } from "./ReportDocument";

/** One consultation report for the patient, with a PDF download (the browser's print to PDF). */
export function ConsultationReport({ id }: { id: string }) {
  const [doc, setDoc] = useState<ReportDoc | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { api<ReportDoc>(`/consultations/${id}`).then(setDoc).catch((e: Error) => setError(e.message)); }, [id]);
  const openFile = (i: number) => api<{ url: string }>(`/consultations/${id}/files/${i}`).then((r) => window.open(r.url, "_blank", "noopener")).catch((e: Error) => setError(e.message));

  return (
    <div className="min-h-dvh bg-wash px-4 pb-16 pt-5 sm:px-6 print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex max-w-3xl items-center justify-between gap-3 print:hidden">
        <Link href="/account" className="flex items-center gap-3 text-[13px] text-muted hover:text-navy">
          <Image src="/brand/logo.svg" alt="Medico To Home" width={120} height={30} className="h-7 w-auto" unoptimized />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/account" className="rounded-full border border-line bg-white px-4 py-2 text-[13px] hover:border-navy">My records</Link>
          {doc && <button onClick={() => window.print()} className="cursor-pointer rounded-full bg-navy px-4 py-2 text-[13px] text-white hover:bg-navy-soft">Download PDF</button>}
        </div>
      </div>
      {error ? (
        <p className="mx-auto max-w-3xl rounded-xl bg-bad-soft px-4 py-3 text-[14px] text-bad">{error === "Please log in." ? "Please log in to see your consultation report." : error}</p>
      ) : doc ? (
        <ReportDocument doc={doc} openFile={openFile} />
      ) : (
        <p className="py-20 text-center text-[14px] text-muted">Loading your report…</p>
      )}
    </div>
  );
}

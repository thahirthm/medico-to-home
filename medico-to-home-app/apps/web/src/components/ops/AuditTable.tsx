"use client";

import { useMemo, useState } from "react";
import { Card, Loading, Table } from "./ui";
import { useApi } from "./useApi";

interface Entry {
  id: number;
  action: string;
  subject: string;
  created_at: string;
  actor_email: string | null;
  actor_name: string | null;
}

export function AuditTable() {
  const { data, error } = useApi<Entry[]>("/admin/audit");
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((e) => !q || `${e.action} ${e.subject} ${e.actor_email}`.toLowerCase().includes(q));
  }, [data, query]);

  if (!data) return <Loading error={error} />;
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by person, action or record" aria-label="Search audit log" className="mb-4 w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-navy sm:max-w-sm" />
      <Card>
        <Table head={["When", "Who", "Action", "Details"]}>
          {rows.map((e) => (
            <tr key={e.id}>
              <td>{new Date(e.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}</td>
              <td>{e.actor_name || e.actor_email || "System"}</td>
              <td><code className="text-[13px]">{e.action}</code></td>
              <td className="max-w-[420px] truncate text-[13px] text-muted" title={e.subject}>{e.subject}</td>
            </tr>
          ))}
        </Table>
        {rows.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">Nothing logged yet.</p>}
      </Card>
    </>
  );
}

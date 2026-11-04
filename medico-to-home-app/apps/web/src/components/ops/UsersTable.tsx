"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Card, Chip, Loading, StatTile, StatusPill, Table } from "./ui";
import { useApi } from "./useApi";

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  family: number;
  bookings: number;
}

const roles: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "patient", label: "Patients" },
  { key: "professional", label: "Professionals" },
  { key: "admin", label: "Staff" },
];
const roleTone = { admin: "warn", professional: "good", patient: "plain" } as const;
const roleLabel: Record<string, string> = { admin: "Staff", professional: "Professional", patient: "Patient" };

const date = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }) : "Never";

export function UsersTable() {
  const router = useRouter();
  const { data, error } = useApi<User[]>("/admin/users");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((u) => (role === "all" || u.role === role) && (!q || `${u.email} ${u.full_name} ${u.phone ?? ""}`.toLowerCase().includes(q)));
  }, [data, query, role]);

  if (!data) return <Loading error={error} />;
  const patients = data.filter((u) => u.role === "patient");

  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatTile label="Total accounts" value={String(data.length)} note="Everyone who has signed up" />
        <StatTile label="Patient accounts" value={String(patients.length)} note={`With a booking: ${patients.filter((u) => u.bookings > 0).length}`} />
        <StatTile label="Family profiles" value={String(data.reduce((n, u) => n + u.family, 0))} note="Across all accounts" />
      </div>
      <div className="mb-4 flex flex-col gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by email, name or mobile" aria-label="Search users" className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-navy sm:max-w-sm" />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {roles.map((r) => <Chip key={r.key} active={role === r.key} onClick={() => setRole(r.key)}>{r.label}</Chip>)}
        </div>
      </div>
      <Card>
        <Table head={["User", "Mobile", "Role", "Joined", "Last login", "Family", "Bookings"]}>
          {rows.map((u) => (
            <tr key={u.id} onClick={() => router.push(`/admin/users/${u.id}`)} className="cursor-pointer hover:bg-wash [&_td:first-child]:hover:bg-wash">
              <td>
                {/* The link makes each row reachable by keyboard and screen reader; the row click is a larger target. */}
                <Link href={`/admin/users/${u.id}`} onClick={(e) => e.stopPropagation()} className="font-normal hover:underline">{u.full_name || "No name yet"}</Link>
                <div className="text-[13px] text-muted">{u.email}</div>
              </td>
              <td>{u.phone || "—"}</td>
              <td><StatusPill tone={roleTone[u.role as keyof typeof roleTone] ?? "plain"}>{roleLabel[u.role] ?? u.role}</StatusPill></td>
              <td>{date(u.created_at)}</td>
              <td>{date(u.last_sign_in_at)}</td>
              <td>{u.family}</td>
              <td>{u.bookings}</td>
            </tr>
          ))}
        </Table>
        {rows.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">No users match this search.</p>}
      </Card>
    </>
  );
}

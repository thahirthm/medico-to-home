"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { BookingBadge } from "./StatusBadges";
import { Card, field, Loading, plainButton, rupees, StatusPill, Table } from "./ui";
import { useApi } from "./useApi";

interface Detail {
  account: {
    id: string; full_name: string; email: string; phone: string | null; dob: string; emergency_contact: string; city: string;
    role: string; staff_roles: string[]; last_mode: string; terms_accepted_at: string | null; created_at: string; last_sign_in_at: string | null; sign_in_with: string[];
  };
  family: { id: string; relation: string; name: string; age: string; gender: string; blood_group: string; share_records: boolean; health_entries: number; reports: number }[];
  addresses: { id: string; label: string; house: string; street: string; landmark: string; locality: string; pincode: string }[];
  bookings: { id: string; service_name: string; patient_name: string; status: string; total_paise: string; sessions: number; created_at: string; professional: string; next_at: string | null }[];
  professional: { id: string; name: string; status: string; rating: string; review_count: number; role: string } | null;
  application: { profession: string; stage: string; decision_note: string; created_at: string } | null;
}

const date = (d: string | null, withTime = false) =>
  d ? new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}) }) : "Never";
const PROVIDERS: Record<string, string> = { google: "Google", email: "Email" };
const STAGES: Record<string, string> = { documents: "Documents check", council: "Council check", police: "ID and police", interview: "Interview", info_needed: "Info needed", approved: "Approved", rejected: "Rejected" };

function Facts({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[minmax(120px,38%)_1fr] gap-x-4 gap-y-2.5 px-5 py-4 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted">{label}</dt>
          <dd className="min-w-0 break-words">{value || <span className="text-faint">Not added</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

const OPEN = ["confirmed", "active", "pending_payment"];

/** Deleting an account: what goes, what stays, and typing the email to confirm. */
function DeleteAccount({ data }: { data: Detail }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const a = data.account;
  const confirmWith = a.email || "DELETE";
  const openBookings = data.bookings.filter((b) => OPEN.includes(b.status)).length;
  const blocked = a.role === "admin" ? "This is a staff account. Remove their staff access under Staff before deleting it."
    : openBookings ? `They have ${openBookings} open booking${openBookings > 1 ? "s" : ""}. Cancel or complete ${openBookings > 1 ? "them" : "it"} first.` : "";

  const remove = async () => {
    setBusy(true);
    setError("");
    try {
      await api(`/admin/users/${a.id}`, { method: "DELETE" });
      router.replace("/admin/users");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-bad/30 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-medium text-bad">Delete this account</h2>
          <p className="mt-1 text-sm text-muted">
            Permanently removes their login, profile, {data.family.length} family health card{data.family.length === 1 ? "" : "s"}, addresses, medical records and uploaded reports.
            {data.bookings.length > 0 && ` Their ${data.bookings.length} past booking${data.bookings.length > 1 ? "s stay" : " stays"} for professional payouts, without their address or notes.`}
            {data.professional && " Their professional listing is hidden."}
          </p>
        </div>
        {!open && (
          <button onClick={() => setOpen(true)} disabled={!!blocked} className="cursor-pointer rounded-full border border-bad/40 bg-white px-4 py-2 text-[13px] text-bad hover:bg-bad-soft disabled:cursor-default disabled:opacity-40">
            Delete account
          </button>
        )}
      </div>
      {blocked && <p className="border-t border-line-soft px-5 py-3 text-[13px] text-warn">{blocked}</p>}
      {open && !blocked && (
        <div className="flex flex-col gap-3 border-t border-line-soft bg-bad-soft/40 px-5 py-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span>This cannot be undone. Type <span className="font-medium select-all">{confirmWith}</span> to confirm.</span>
            <input className={`${field} max-w-md`} autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={confirmWith} autoComplete="off" />
          </label>
          {error && <p role="alert" className="text-sm text-bad">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button onClick={remove} disabled={busy || typed.trim().toLowerCase() !== confirmWith.toLowerCase()}
              className="cursor-pointer rounded-full bg-bad px-4 py-2 text-[13px] text-white hover:opacity-90 disabled:cursor-default disabled:opacity-40">
              {busy ? "Deleting…" : "Delete account permanently"}
            </button>
            <button onClick={() => { setOpen(false); setTyped(""); setError(""); }} className={plainButton}>Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}

/** One account in full, for the care team. Health records stay private: only how many entries and reports exist. */
export function UserDetail({ id }: { id: string }) {
  const { data, error } = useApi<Detail>(`/admin/users/${id}`);
  if (!data) return <Loading error={error} />;
  const a = data.account;
  const role = a.role === "admin" ? "Staff" : data.professional ? "Professional" : "Patient";

  return (
    <div className="grid gap-5">
      <Link href="/admin/users" className="text-sm text-muted hover:text-navy">← All users</Link>

      <Card>
        <div className="flex flex-wrap items-center gap-5 p-5">
          <span className="flex size-16 flex-none items-center justify-center rounded-full bg-wash text-2xl font-medium">{(a.full_name || a.email || "?")[0]!.toUpperCase()}</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">{a.full_name || "No name yet"}</h1>
            <p className="truncate text-sm text-muted">{a.email}{a.phone ? ` · ${a.phone}` : ""}</p>
          </div>
          <StatusPill tone={role === "Staff" ? "warn" : role === "Professional" ? "good" : "plain"}>{role}</StatusPill>
        </div>
        <div className="grid grid-cols-2 border-t border-line-soft sm:grid-cols-4">
          {[["Joined", date(a.created_at)], ["Last login", date(a.last_sign_in_at, true)], ["Family", String(data.family.length)], ["Bookings", String(data.bookings.length)]].map(([k, v]) => (
            <div key={k} className="border-line-soft px-5 py-3 odd:border-r sm:border-r sm:last:border-r-0">
              <div className="text-[12px] text-muted">{k}</div>
              <div className="text-[15px]">{v}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Contact">
          <Facts rows={[["Mobile", a.phone], ["Email", a.email], ["City", a.city], ["Date of birth", a.dob], ["Emergency contact", a.emergency_contact]]} />
        </Card>
        <Card title="Account">
          <Facts rows={[
            ["Signs in with", a.sign_in_with.map((p) => PROVIDERS[p] ?? p).join(", ")],
            ["Terms accepted", a.terms_accepted_at ? date(a.terms_accepted_at) : "Not yet"],
            ["Opens in", a.last_mode === "professional" ? "Professional mode" : "Patient mode"],
            ...(a.role === "admin" ? [["Staff roles", a.staff_roles.join(", ").replaceAll("_", " ")] as [string, ReactNode]] : []),
          ]} />
        </Card>
      </div>

      {(data.professional || data.application) && (
        <Card title="Professional" action={data.professional && <Link href="/admin/professionals" className="text-[13px] underline">Professionals</Link>}>
          {data.professional ? (
            <Facts rows={[
              ["Listed as", `${data.professional.name} · ${data.professional.role}`],
              ["Status", <StatusPill key="s" tone={data.professional.status === "live" ? "good" : "warn"}>{data.professional.status === "live" ? "Live" : data.professional.status === "hidden" ? "Hidden" : "Not live yet"}</StatusPill>],
              ["Rating", data.professional.review_count ? `${Number(data.professional.rating).toFixed(1)} from ${data.professional.review_count} reviews` : "No reviews yet"],
            ]} />
          ) : (
            <Facts rows={[
              ["Applied as", data.application!.profession],
              ["Stage", STAGES[data.application!.stage] ?? data.application!.stage],
              ["Applied on", date(data.application!.created_at)],
              ...(data.application!.decision_note ? [["Note to applicant", data.application!.decision_note] as [string, ReactNode]] : []),
            ]} />
          )}
        </Card>
      )}

      <Card title={`Family profiles · ${data.family.length}`}>
        {data.family.length ? (
          <Table head={["Name", "Relation", "Age", "Gender", "Blood group", "Health data", "Shares records"]}>
            {data.family.map((f) => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td>{f.relation}</td>
                <td>{f.age || "—"}</td>
                <td>{f.gender || "—"}</td>
                <td>{f.blood_group || "—"}</td>
                <td className="text-muted">{f.health_entries} entries · {f.reports} reports</td>
                <td>{f.share_records ? "Yes" : "No"}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted">No family profiles yet.</p>
        )}
        <p className="border-t border-line-soft px-5 py-3 text-[12px] text-muted">Conditions, medicines and reports are private to the family and are not shown here.</p>
      </Card>

      <Card title={`Addresses · ${data.addresses.length}`}>
        {data.addresses.length ? (
          <ul>
            {data.addresses.map((ad) => (
              <li key={ad.id} className="border-b border-line-soft px-5 py-3 text-sm last:border-0">
                <span className="font-medium">{ad.label}</span>
                <span className="text-muted"> · {[ad.house, ad.street, ad.landmark, ad.locality, ad.pincode].filter(Boolean).join(", ")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted">No saved addresses.</p>
        )}
      </Card>

      <Card title={`Bookings · ${data.bookings.length}`}>
        {data.bookings.length ? (
          <Table head={["Booking", "Service", "For", "Professional", "Status", "Total", "Next visit", "Booked"]}>
            {data.bookings.map((b) => (
              <tr key={b.id}>
                <td className="font-medium">{b.id}</td>
                <td>{b.service_name}{b.sessions > 1 ? ` · ${b.sessions} sessions` : ""}</td>
                <td>{b.patient_name}</td>
                <td>{b.professional}</td>
                <td><BookingBadge status={b.status} /></td>
                <td>{rupees(Number(b.total_paise) / 100)}</td>
                <td>{b.next_at ? date(b.next_at, true) : "—"}</td>
                <td>{date(b.created_at)}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted">No bookings yet.</p>
        )}
      </Card>

      <DeleteAccount data={data} />
    </div>
  );
}

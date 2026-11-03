"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { useMe } from "./AuthGate";
import { Card, field, Loading, plainButton, primaryButton, StatusPill, Table } from "./ui";
import { useApi } from "./useApi";

const ROLES = [
  { key: "super_admin", label: "Super admin" },
  { key: "operations", label: "Operations" },
  { key: "verification", label: "Verification" },
  { key: "finance", label: "Finance" },
  { key: "support", label: "Support" },
  { key: "sos_dispatcher", label: "SOS dispatcher" },
  { key: "content", label: "Content" },
];
const label = (key: string) => ROLES.find((r) => r.key === key)?.label ?? key;

interface Staff {
  id: string;
  email: string;
  full_name: string;
  staff_roles: string[];
  last_sign_in_at: string | null;
  two_step: boolean;
}

function RolePicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ROLES.map((r) => {
        const on = value.includes(r.key);
        return (
          <button type="button" key={r.key} onClick={() => onChange(on ? value.filter((x) => x !== r.key) : [...value, r.key])} aria-pressed={on}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-[13px] ${on ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}>
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

export function StaffTable() {
  const me = useMe();
  const { data, error, reload } = useApi<Staff[]>("/admin/staff");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<string[]>(["support"]);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [formError, setFormError] = useState("");
  const [editing, setEditing] = useState<{ id: string; roles: string[] } | null>(null);

  const invite = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      const r = await api<{ email: string; password: string }>("/admin/staff", { body: { full_name: name, email, roles } });
      setCreated(r);
      setName("");
      setEmail("");
      reload();
    } catch (err) {
      setFormError((err as Error).message);
    }
  };
  const saveRoles = () => editing && api(`/admin/staff/${editing.id}`, { method: "PATCH", body: { roles: editing.roles } }).then(() => { setEditing(null); reload(); }).catch((e: Error) => alert(e.message));
  const remove = (s: Staff) => confirm(`Remove ${s.email} from staff? Their account stays as a normal patient account.`) && api(`/admin/staff/${s.id}`, { method: "DELETE" }).then(reload).catch((e: Error) => alert(e.message));

  if (!data) return <Loading error={error} />;

  return (
    <div className="grid gap-4">
      <Card title="Invite staff">
        <form onSubmit={invite} className="grid gap-3 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={field} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" aria-label="Full name" />
            <input className={field} required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" aria-label="Work email" />
          </div>
          <RolePicker value={roles} onChange={setRoles} />
          {formError && <p role="alert" className="text-sm text-bad">{formError}</p>}
          <button className={`${primaryButton} justify-self-start`}>Create staff login</button>
          {created && (
            <div role="status" className="rounded-xl bg-good-soft p-4 text-sm text-navy">
              Login created for <strong>{created.email}</strong>. One-time password: <code className="rounded bg-white px-1.5 py-0.5">{created.password}</code>
              <div className="mt-1 text-[13px] text-body">Share it in person or by phone. It is shown only once. They set up their 2-step code on first sign-in.</div>
            </div>
          )}
        </form>
      </Card>
      <Card>
        <Table head={["Staff member", "Roles", "2-step", "Last sign-in", ""]}>
          {data.map((s) => (
            <tr key={s.id}>
              <td>
                <div className="font-normal">{s.full_name || "No name"}{s.id === me.id && <span className="text-muted"> (you)</span>}</div>
                <div className="text-[13px] text-muted">{s.email}</div>
              </td>
              <td className="!whitespace-normal">
                {editing?.id === s.id ? (
                  <div className="grid gap-2">
                    <RolePicker value={editing.roles} onChange={(r) => setEditing({ id: s.id, roles: r })} />
                    <div className="flex gap-2"><button onClick={saveRoles} className={primaryButton}>Save</button><button onClick={() => setEditing(null)} className={plainButton}>Cancel</button></div>
                  </div>
                ) : (
                  s.staff_roles.map(label).join(", ") || "None"
                )}
              </td>
              <td><StatusPill tone={s.two_step ? "good" : "warn"}>{s.two_step ? "Set up" : "Not yet"}</StatusPill></td>
              <td>{s.last_sign_in_at ? new Date(s.last_sign_in_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) : "Never"}</td>
              <td className="text-right">
                {editing?.id !== s.id && (
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditing({ id: s.id, roles: s.staff_roles })} className={plainButton}>Edit roles</button>
                    {s.id !== me.id && <button onClick={() => remove(s)} className={plainButton}>Remove</button>}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

"use client";

import { useMemo, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { Card, Chip, field, Loading, plainButton, primaryButton, rowAction, rupees, StatusPill, Table } from "./ui";
import { useApi } from "./useApi";

interface Professional {
  id: string;
  name: string;
  gender: string;
  category_key: string;
  role: string;
  qualification: string;
  experience_years: number;
  locality: string;
  languages: string[];
  base_price: number;
  radius_km: number;
  bio: string;
  photo_url: string;
  registration_no: string;
  available_today_from: string;
  status: string;
  online: boolean;
  rating: string;
  review_count: number;
  is_demo: boolean;
}

const QUALITY_FLOOR = 4.3;

function Switch({ on, disabled, onClick, label, tone = "bg-good" }: { on: boolean; disabled?: boolean; onClick: () => void; label: string; tone?: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={onClick}
      className={`relative h-6 w-11 flex-none cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${on ? tone : "bg-line"}`}>
      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

const LISTING: Record<string, { label: string; note: string }> = {
  live: { label: "Live", note: "Families can book" },
  pending: { label: "Not live yet", note: "Approved, waiting for you" },
  hidden: { label: "Hidden", note: "Taken off by staff" },
};
const blank = { name: "", gender: "F", category_key: "doctor", qualification: "", experience_years: 0, locality: "", languages: [] as string[], base_price: 500, radius_km: 8, bio: "", photo_url: "", registration_no: "", available_today_from: "", status: "pending" };
type Draft = typeof blank & { id?: string };

function Editor({ draft, categories, localities, onClose }: { draft: Draft; categories: { key: string; label: string }[]; localities: { name: string }[]; onClose: (saved: boolean) => void }) {
  const [form, setForm] = useState<Draft>(draft);
  const [error, setError] = useState("");
  const set = (k: keyof Draft, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const text = (label: string, k: keyof Draft, type = "text") => (
    <label className="block text-[13px] text-muted">
      {label}
      <input type={type} className={`${field} mt-1`} value={String(form[k] ?? "")} onChange={(e) => set(k, e.target.value)} />
    </label>
  );
  const save = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api(form.id ? `/admin/professionals/${form.id}` : "/admin/professionals", { method: form.id ? "PATCH" : "POST", body: form });
      onClose(true);
    } catch (err) {
      setError((err as Error).message);
    }
  };
  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-navy/30" onClick={() => onClose(false)}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-md space-y-3 overflow-y-auto bg-white p-5">
        <h2 className="text-lg font-medium">{form.id ? "Edit professional" : "Add professional"}</h2>
        {text("Full name", "name")}
        <label className="block text-[13px] text-muted">
          Category
          <select className={`${field} mt-1`} value={form.category_key} onChange={(e) => set("category_key", e.target.value)}>
            {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </label>
        <label className="block text-[13px] text-muted">
          Locality
          <select className={`${field} mt-1`} value={form.locality} onChange={(e) => set("locality", e.target.value)}>
            <option value="">Choose…</option>
            {localities.map((l) => <option key={l.name}>{l.name}</option>)}
          </select>
        </label>
        <label className="block text-[13px] text-muted">
          Gender
          <select className={`${field} mt-1`} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="F">Female</option>
            <option value="M">Male</option>
          </select>
        </label>
        {text("Qualification", "qualification")}
        {text("Registration number", "registration_no")}
        {text("Experience (years)", "experience_years", "number")}
        {text("Base price (₹)", "base_price", "number")}
        {text("Service radius (km)", "radius_km", "number")}
        {text("Photo URL", "photo_url")}
        {text("Available today from (e.g. 4:30 PM)", "available_today_from")}
        <label className="block text-[13px] text-muted">
          Languages, separated by commas
          <input className={`${field} mt-1`} value={form.languages.join(", ")} onChange={(e) => set("languages", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} />
        </label>
        <label className="block text-[13px] text-muted">
          About
          <textarea rows={4} className={`${field} mt-1`} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
        </label>
        <label className="block text-[13px] text-muted">
          Status
          <select className={`${field} mt-1`} value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="pending">Pending</option>
            <option value="live">Live</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>
        {error && <p role="alert" className="text-sm text-bad">{error}</p>}
        <div className="flex gap-2 pt-2">
          <button className={primaryButton}>Save</button>
          <button type="button" onClick={() => onClose(false)} className={plainButton}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export function ProfessionalsTable() {
  const { data, error, reload } = useApi<Professional[]>("/admin/professionals");
  const cats = useApi<{ key: string; label: string }[]>("/admin/content/categories");
  const locs = useApi<{ name: string }[]>("/admin/localities");
  const [query, setQuery] = useState("");
  const [waitingOnly, setWaitingOnly] = useState(false);
  const [busy, setBusy] = useState("");
  const [category, setCategory] = useState("all");
  const [draft, setDraft] = useState<Draft | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((p) => (!waitingOnly || p.status === "pending") && (category === "all" || p.category_key === category) && (!q || `${p.name} ${p.locality}`.toLowerCase().includes(q)));
  }, [data, query, category, waitingOnly]);

  if (!data || !cats.data || !locs.data) return <Loading error={error || cats.error || locs.error} />;

  const change = (id: string, path: string, body: object) => {
    setBusy(id + path);
    api(`/admin/professionals/${id}/${path}`, { method: "PATCH", body }).then(reload).catch((e: Error) => alert(e.message)).finally(() => setBusy(""));
  };
  const setStatus = (p: Professional, live: boolean) => {
    if (!live && !confirm(`Take ${p.name} off live? Families will no longer find or book them, and they go offline.`)) return;
    change(p.id, "status", { status: live ? "live" : "hidden" });
  };
  const waiting = data.filter((p) => p.status === "pending");

  return (
    <>
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or locality" aria-label="Search professionals" className="min-w-0 flex-1 rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-navy sm:max-w-sm" />
          <button onClick={() => setDraft({ ...blank })} className={primaryButton}>Add professional</button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip active={category === "all"} onClick={() => setCategory("all")}>All</Chip>
          {cats.data.map((c) => <Chip key={c.key} active={category === c.key} onClick={() => setCategory(c.key)}>{c.label}</Chip>)}
        </div>
      </div>
      {waiting.length > 0 && !waitingOnly && (
        <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-warn-soft px-5 py-3.5 text-[14px] text-warn">
          <span><strong className="font-medium">{waiting.length} approved {waiting.length === 1 ? "Medico is" : "Medicos are"} waiting to go live.</strong> Check their profile and switch Live on so families can book them.</span>
          <button onClick={() => setWaitingOnly(true)} className={plainButton}>Show {waiting.length === 1 ? "them" : `all ${waiting.length}`}</button>
        </div>
      )}
      {waitingOnly && (
        <div className="mb-4 flex items-center justify-between gap-3 text-[14px]">
          <span>Showing approved Medicos waiting to go live.</span>
          <button onClick={() => setWaitingOnly(false)} className={plainButton}>Show everyone</button>
        </div>
      )}
      <Card>
        <Table head={["Name", "Category", "Locality", "Price", "Rating", "Listing", "Availability", ""]}>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="font-normal">{p.name}</div>
                <div className="text-[13px] text-muted">{p.registration_no || "No registration number"}</div>
              </td>
              <td>{p.role}</td>
              <td>{p.locality}</td>
              <td>{rupees(p.base_price)}</td>
              <td>
                ★ {Number(p.rating).toFixed(1)} <span className="text-muted">({p.review_count})</span>
                {p.status === "live" && Number(p.rating) > 0 && Number(p.rating) < QUALITY_FLOOR && <div className="mt-1"><StatusPill tone="warn">Needs review</StatusPill></div>}
              </td>
              <td>
                <div className="flex items-center gap-3">
                  <Switch on={p.status === "live"} disabled={busy === p.id + "status"} onClick={() => setStatus(p, p.status !== "live")} label={`${p.name}: live`} />
                  <span className="leading-tight whitespace-nowrap">
                    <span className={`block text-[13px] ${p.status === "live" ? "text-good" : p.status === "pending" ? "text-warn" : "text-bad"}`}>{LISTING[p.status]?.label ?? p.status}{p.is_demo && p.status === "live" ? " · demo" : ""}</span>
                    <span className="block text-[12px] text-muted">{LISTING[p.status]?.note}</span>
                  </span>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-3">
                  <Switch on={p.online} disabled={p.status !== "live" || busy === p.id + "online"} onClick={() => change(p.id, "online", { online: !p.online })} label={`${p.name}: online`} />
                  <span className="flex items-center gap-1.5 text-[13px] whitespace-nowrap">
                    <span className={`size-2 rounded-full ${p.online ? "bg-good" : "bg-line"}`} />
                    {p.online ? "Online" : "Offline"}
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap text-right text-[13px]">
                <button onClick={() => setDraft({ ...blank, ...p, id: p.id })} className={rowAction}>Edit</button>
              </td>
            </tr>
          ))}
        </Table>
        {rows.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">No professionals match this search.</p>}
      </Card>
      {draft && <Editor draft={draft} categories={cats.data} localities={locs.data} onClose={(saved) => { setDraft(null); if (saved) reload(); }} />}
    </>
  );
}

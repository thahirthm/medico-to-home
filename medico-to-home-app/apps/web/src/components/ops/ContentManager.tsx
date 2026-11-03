"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { api } from "@/lib/api";
import { Card, Chip, field, Loading, plainButton, primaryButton, rowAction, Table } from "./ui";
import { useApi } from "./useApi";

type Row = Record<string, any>;
interface Column { key: string; label: string; long?: boolean; list?: boolean; number?: boolean }
interface Kind { label: string; path: string; idKey: string; columns: Column[]; canAdd?: boolean; canDelete?: boolean; canEdit?: boolean }

const kinds: Record<string, Kind> = {
  services: {
    label: "Services", path: "/admin/content/service_templates", idKey: "id", canAdd: true, canDelete: true, canEdit: true,
    columns: [{ key: "category_key", label: "Category key" }, { key: "name", label: "Service" }, { key: "multiplier", label: "Price multiplier", number: true }, { key: "duration", label: "Duration" }, { key: "sort_order", label: "Order", number: true }],
  },
  therapies: {
    label: "Therapies", path: "/admin/content/therapies", idKey: "id", canAdd: true, canDelete: true, canEdit: true,
    columns: [{ key: "id", label: "ID" }, { key: "label", label: "Title" }, { key: "category_key", label: "Category key" }, { key: "brand", label: "Brand" }, { key: "helps", label: "What it helps with", long: true }, { key: "steps", label: "Session steps, one per line", long: true, list: true }, { key: "plan", label: "Typical plan" }],
  },
  faqs: {
    label: "FAQs", path: "/admin/content/faqs", idKey: "id", canAdd: true, canDelete: true, canEdit: true,
    columns: [{ key: "question", label: "Question" }, { key: "answer", label: "Answer", long: true }, { key: "sort_order", label: "Order", number: true }],
  },
  categories: {
    label: "Categories", path: "/admin/content/categories", idKey: "key", canEdit: true,
    columns: [{ key: "label", label: "Plural label" }, { key: "one", label: "Singular" }, { key: "plural", label: "Lowercase plural" }, { key: "brand", label: "Brand" }, { key: "unit", label: "Price unit" }, { key: "registration_label", label: "Registration label" }],
  },
  localities: {
    label: "Localities", path: "/admin/localities", idKey: "id", canAdd: true, canDelete: true,
    columns: [{ key: "name", label: "Name" }, { key: "district", label: "District" }, { key: "pincode", label: "Pincode" }, { key: "lat", label: "Latitude", number: true }, { key: "lng", label: "Longitude", number: true }],
  },
};

function Rows({ kind }: { kind: Kind }) {
  const { data, error, reload } = useApi<Row[]>(kind.path);
  const [draft, setDraft] = useState<Row | null>(null);
  const [fail, setFail] = useState("");
  if (!data) return <Loading error={error} />;

  const editing = draft?.[kind.idKey] !== undefined && data.some((r) => r[kind.idKey] === draft?.[kind.idKey]);
  const save = async () => {
    if (!draft) return;
    const body: Row = {};
    for (const c of kind.columns) {
      const v = draft[c.key];
      body[c.key] = c.list ? String(Array.isArray(v) ? v.join("\n") : v ?? "").split("\n").map((x) => x.trim()).filter(Boolean) : c.number ? Number(v ?? 0) : (v ?? "");
    }
    try {
      await api(editing ? `${kind.path}/${draft[kind.idKey]}` : kind.path, { method: editing ? "PATCH" : "POST", body });
      setDraft(null);
      setFail("");
      await reload();
    } catch (e) {
      setFail((e as Error).message);
    }
  };
  const remove = (row: Row) => {
    if (window.confirm("Delete this item?")) api(`${kind.path}/${row[kind.idKey]}`, { method: "DELETE" }).then(reload).catch((e: Error) => setFail(e.message));
  };

  const shown = kind.columns.filter((c) => !c.long).slice(0, 4);
  return (
    <>
      {kind.canAdd && <button onClick={() => setDraft({})} className={`${primaryButton} mb-4`}>Add new</button>}
      {fail && !draft && <p role="alert" className="mb-3 text-sm text-bad">{fail}</p>}
      <Card>
        <Table head={[...shown.map((c) => c.label), ""]}>
          {data.map((r) => (
            <tr key={String(r[kind.idKey])}>
              {shown.map((c) => <td key={c.key}>{String(r[c.key] ?? "")}</td>)}
              <td className="whitespace-nowrap text-right text-[13px]">
                {kind.canEdit && <button onClick={() => setDraft(r)} className={rowAction}>Edit</button>}
                {kind.canDelete && <button onClick={() => remove(r)} className={rowAction}>Delete</button>}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
      {draft && (
        <div className="fixed inset-0 z-20 flex justify-end bg-navy/30" onClick={() => setDraft(null)}>
          <div onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-md space-y-3 overflow-y-auto bg-white p-5">
            <h2 className="text-lg font-medium">{editing ? "Edit" : "Add"} {kind.label.toLowerCase()}</h2>
            {kind.columns.map((c) => {
              const value = Array.isArray(draft[c.key]) ? draft[c.key].join("\n") : String(draft[c.key] ?? "");
              const change = (v: string) => setDraft({ ...draft, [c.key]: v });
              return (
                <label key={c.key} className="block text-[13px] text-muted">
                  {c.label}
                  {c.long ? <textarea rows={5} className={`${field} mt-1`} value={value} onChange={(e) => change(e.target.value)} /> : <input className={`${field} mt-1`} value={value} onChange={(e) => change(e.target.value)} />}
                </label>
              );
            })}
            {fail && <p role="alert" className="text-sm text-bad">{fail}</p>}
            <div className="flex gap-2 pt-2">
              <button onClick={save} className={primaryButton}>Save</button>
              <button onClick={() => setDraft(null)} className={plainButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ContentManager() {
  const [tab, setTab] = useState("services");
  const kind = kinds[tab]!;
  return (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {Object.entries(kinds).map(([k, v]) => <Chip key={k} active={tab === k} onClick={() => setTab(k)}>{v.label}</Chip>)}
      </div>
      <Rows key={tab} kind={kind} />
    </>
  );
}

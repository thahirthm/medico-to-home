"use client";

import { useState } from "react";
import { bookingLabels, BookingBadge } from "./StatusBadges";
import { Card, Chip, Loading, rupees, Table } from "./ui";
import { useApi } from "./useApi";

interface Row {
  id: string;
  patient_name: string;
  service_name: string;
  status: string;
  total_paise: string;
  payment_status: string;
  locality: string;
  professional: string;
  next_at: string | null;
}

const when = (d: string | null) => (d ? new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true }) : "—");

export function BookingsTable() {
  const { data, error } = useApi<Row[]>("/admin/bookings");
  const [filter, setFilter] = useState("all");
  if (!data) return <Loading error={error} />;
  const rows = data.filter((b) => filter === "all" || b.status === filter);
  return (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
        {Object.entries(bookingLabels).map(([k, v]) => <Chip key={k} active={filter === k} onClick={() => setFilter(k)}>{v.label}</Chip>)}
      </div>
      <Card>
        <Table head={["Booking", "Patient", "Professional", "Next visit", "Status", "Amount"]}>
          {rows.map((b) => (
            <tr key={b.id}>
              <td><div className="font-normal">{b.id}</div><div className="text-[13px] text-muted">{b.service_name}</div></td>
              <td>{b.patient_name}</td>
              <td>{b.professional}</td>
              <td>{when(b.next_at)}<div className="text-[13px] text-muted">{b.locality}</div></td>
              <td><BookingBadge status={b.status} /></td>
              <td><div className="font-normal">{rupees(Number(b.total_paise) / 100)}</div><div className="text-[13px] text-muted">{b.payment_status === "unpaid" ? "Unpaid" : "Paid"}</div></td>
            </tr>
          ))}
        </Table>
        {rows.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">No bookings here yet.</p>}
      </Card>
    </>
  );
}

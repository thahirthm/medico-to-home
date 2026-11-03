"use client";

import { api } from "@/lib/api";
import { Card, Loading, primaryButton, rupees, StatTile, StatusPill, Table } from "./ui";
import { useApi } from "./useApi";

interface Row {
  id: string;
  name: string;
  visits: number;
  gross: number;
  net: number;
  paid: boolean;
}

export function PayoutsTable() {
  const { data, error, reload } = useApi<Row[]>("/admin/payouts");
  if (!data) return <Loading error={error} />;
  const gross = data.reduce((n, p) => n + p.gross, 0);
  const net = data.reduce((n, p) => n + p.net, 0);
  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatTile label="Visit fees this week" value={rupees(gross)} note={`${data.length} professionals`} />
        <StatTile label="Commission" value={rupees(gross - net)} note="12% of fees" />
        <StatTile label="To pay" value={rupees(net)} note="Completed visits only" />
      </div>
      <Card title="This week's payouts">
        <Table head={["Professional", "Visits", "Fees", "Commission", "Payout", ""]}>
          {data.map((p) => (
            <tr key={p.id}>
              <td className="font-normal">{p.name}</td>
              <td>{p.visits}</td>
              <td>{rupees(p.gross)}</td>
              <td>{rupees(p.gross - p.net)}</td>
              <td className="font-normal">{rupees(p.net)}</td>
              <td className="text-right">
                {p.paid ? <StatusPill tone="good">Recorded as paid</StatusPill> : <button onClick={() => api(`/admin/payouts/${p.id}/paid`, { body: {} }).then(reload)} className={primaryButton}>Record as paid</button>}
              </td>
            </tr>
          ))}
        </Table>
        {data.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">Nothing to pay yet. Earnings appear when visits are completed.</p>}
      </Card>
      <p className="mt-3 text-[13px] text-muted">This records the payout only. No money moves until bank transfers are connected.</p>
    </>
  );
}

import { AuditTable } from "@/components/ops/AuditTable";
import { PageHead } from "@/components/ops/ui";

export const metadata = { title: "Audit log" };

export default function Page() {
  return (
    <>
      <PageHead title="Audit log" note="Every change made in this dashboard, and every time medical records are opened. Newest first." />
      <AuditTable />
    </>
  );
}

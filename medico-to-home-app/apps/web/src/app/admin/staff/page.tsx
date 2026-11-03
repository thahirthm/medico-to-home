import { StaffTable } from "@/components/ops/StaffTable";
import { PageHead } from "@/components/ops/ui";

export const metadata = { title: "Staff & roles" };

export default function Page() {
  return (
    <>
      <PageHead title="Staff & roles" note="Invited staff only. Each role opens only its own sections of the dashboard." />
      <StaffTable />
    </>
  );
}

import { ProfessionalsTable } from "@/components/ops/ProfessionalsTable";
import { PageHead } from "@/components/ops/ui";

export const metadata = { title: "Professionals" };

export default function ProfessionalsPage() {
  return (
    <>
      <PageHead title="Professionals" note="Anyone rated below 4.3 is flagged for the care team to review." />
      <ProfessionalsTable />
    </>
  );
}

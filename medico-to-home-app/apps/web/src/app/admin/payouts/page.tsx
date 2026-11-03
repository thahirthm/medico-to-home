import { PayoutsTable } from "@/components/ops/PayoutsTable";
import { PageHead } from "@/components/ops/ui";

export const metadata = { title: "Payouts" };

export default function PayoutsPage() {
  return (
    <>
      <PageHead title="Payouts" note="Weekly payouts from completed visits, after 12% commission." />
      <PayoutsTable />
    </>
  );
}

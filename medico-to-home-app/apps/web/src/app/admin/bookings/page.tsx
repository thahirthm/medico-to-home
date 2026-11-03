import { BookingsTable } from "@/components/ops/BookingsTable";
import { PageHead } from "@/components/ops/ui";

export const metadata = { title: "Bookings" };

export default function BookingsPage() {
  return (
    <>
      <PageHead title="Bookings" note="Every booking across Kozhikode and Malappuram." />
      <BookingsTable />
    </>
  );
}

import { UsersTable } from "@/components/ops/UsersTable";
import { PageHead } from "@/components/ops/ui";

export const metadata = { title: "Users" };

export default function Page() {
  return (
    <>
      <PageHead title="Users" note="Every account created. Medical records are not shown here." />
      <UsersTable />
    </>
  );
}

import { ApplicationsBoard } from "@/components/ops/ApplicationsBoard";
import { PageHead } from "@/components/ops/ui";

export const metadata = { title: "Applications" };

export default function ApplicationsPage() {
  return (
    <>
      <PageHead title="Applications" note="Nobody appears in search until every check here is passed." />
      <ApplicationsBoard />
    </>
  );
}

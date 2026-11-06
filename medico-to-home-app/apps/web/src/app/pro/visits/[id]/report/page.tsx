import { ClinicalLists, ReportForm } from "@/components/reports/ReportForm";

export const metadata = { title: "Consultation report" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <ClinicalLists />
      <ReportForm visitId={id} />
    </>
  );
}

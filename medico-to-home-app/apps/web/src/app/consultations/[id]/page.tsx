import { ConsultationReport } from "@/components/reports/ConsultationReport";

export const metadata = { title: "Consultation report", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ConsultationReport id={id} />;
}

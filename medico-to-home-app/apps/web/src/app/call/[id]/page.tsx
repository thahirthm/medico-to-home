import { CallRoom } from "@/components/call/CallRoom";

export const metadata = { title: "Video consultation", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CallRoom id={id} />;
}

import { UserDetail } from "@/components/ops/UserDetail";

export const metadata = { title: "User" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <UserDetail id={(await params).id} />;
}

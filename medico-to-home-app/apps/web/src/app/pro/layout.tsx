import { ProShell } from "@/components/ops/ProShell";

export const metadata = { title: "Professional", robots: { index: false } };

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return <ProShell>{children}</ProShell>;
}

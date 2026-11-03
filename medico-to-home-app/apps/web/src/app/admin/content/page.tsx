import { ContentManager } from "@/components/ops/ContentManager";
import { PageHead } from "@/components/ops/ui";

export const metadata = { title: "Content" };

export default function Page() {
  return (
    <>
      <PageHead title="Content" note="Changes appear on the website straight away." />
      <ContentManager />
    </>
  );
}

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Overlays } from "@/components/site/Overlays";
import { SiteProvider } from "@/components/site/SiteProvider";
import { API_URL } from "@/lib/api";
import "@/components/site/site.css";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // On the server, reach the API directly when API_INTERNAL_URL is set (production), skipping the public internet.
  const res = await fetch(`${process.env.API_INTERNAL_URL ?? API_URL}/catalogue`, { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load the catalogue");
  return (
    <SiteProvider catalogue={await res.json()}>
      <Header />
      {children}
      <Footer />
      <Overlays />
    </SiteProvider>
  );
}

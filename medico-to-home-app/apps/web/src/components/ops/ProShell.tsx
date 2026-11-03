"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { setMode } from "@/lib/api";
import { AuthGate, signOut } from "./AuthGate";

const nav = [
  { href: "/pro", label: "Visits" },
  { href: "/pro/schedule", label: "Schedule" },
  { href: "/pro/earnings", label: "Earnings" },
  { href: "/pro/profile", label: "Profile" },
];

// The role switcher: back to the patient side of the same account. A full load resets the patient store.
// eslint-disable-next-line @next/next/no-location-assign-relative-destination
const toPatient = () => setMode("patient").finally(() => window.location.assign("/"));

export function ProShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AuthGate area="professional">
    <div className="mx-auto flex min-h-screen max-w-xl flex-col bg-wash">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-4 py-3">
        <Link href="/pro" className="flex min-h-10 items-center">
          <Image src="/brand/logo.svg" alt="Medico To Home" width={120} height={28} className="h-6 w-auto" unoptimized />
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={toPatient} className="min-h-10 cursor-pointer rounded-lg px-3 text-sm text-navy hover:bg-wash" title="Switch to patient mode">⇄ Patient mode</button>
          <button onClick={signOut} className="min-h-10 cursor-pointer rounded-lg px-3 text-sm text-muted hover:bg-wash hover:text-navy">Log out</button>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 pb-24">
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-xl border-t border-line bg-white">
        {nav.map((item) => {
          const active = item.href === "/pro" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex-1 py-3.5 text-center text-[13px] ${active ? "font-medium text-navy" : "text-muted"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
    </AuthGate>
  );
}

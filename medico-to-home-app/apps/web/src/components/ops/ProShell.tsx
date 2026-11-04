"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { setMode } from "@/lib/api";
import { AuthGate, signOut, useMe } from "./AuthGate";

const ALL = [
  { href: "/pro", label: "Dashboard" },
  { href: "/pro/visits", label: "Visits" },
  { href: "/pro/schedule", label: "Schedule" },
  { href: "/pro/earnings", label: "Earnings" },
  { href: "/pro/profile", label: "Profile" },
];
// Visits, schedule and earnings open once the registration is approved.
const PENDING = ALL.filter((item) => item.href === "/pro" || item.href === "/pro/profile");

// The role switcher: back to the patient side of the same account. A full load resets the patient store.
// eslint-disable-next-line @next/next/no-location-assign-relative-destination
const toPatient = () => setMode("patient").finally(() => window.location.assign("/"));

/** Professional mode: top navigation on desktop, a bottom tab bar on phones. */
export function ProShell({ children }: { children: ReactNode }) {
  return (
    <AuthGate area="professional">
      <ProFrame>{children}</ProFrame>
    </AuthGate>
  );
}

function ProFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const nav = useMe().professional ? ALL : PENDING;
  const active = (href: string) => (href === "/pro" ? pathname === href : pathname.startsWith(href));
  return (
    <div className="flex min-h-screen flex-col bg-wash">
      <header className="sticky top-0 z-10 border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/pro" className="flex min-h-10 items-center gap-2">
              <Image src="/brand/logo.svg" alt="Medico To Home" width={120} height={28} className="h-6 w-auto" unoptimized />
              <span className="rounded-full bg-wash px-2 py-0.5 text-[11px] text-muted">Medico</span>
            </Link>
            <nav className="hidden gap-1 md:flex" aria-label="Professional mode">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-sm ${active(item.href) ? "bg-navy text-white" : "text-body hover:bg-wash"}`}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toPatient} className="min-h-10 cursor-pointer rounded-lg px-3 text-sm text-navy hover:bg-wash" title="Switch to patient mode">⇄ Patient mode</button>
            <button onClick={signOut} className="min-h-10 cursor-pointer rounded-lg px-3 text-sm text-muted hover:bg-wash hover:text-navy">Log out</button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 p-4 pb-24 sm:p-6 md:pb-10">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-line bg-white md:hidden" aria-label="Professional mode">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}
            className={`flex-1 py-3.5 text-center text-[12px] ${active(item.href) ? "font-medium text-navy" : "text-muted"}`}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

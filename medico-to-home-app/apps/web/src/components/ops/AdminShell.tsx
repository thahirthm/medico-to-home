"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AuthGate, signOut, useMe } from "./AuthGate";

// Each link opens for the staff roles allowed that module (see MODULES in the API).
const nav = [
  { href: "/admin", label: "Overview", module: "overview" },
  { href: "/admin/applications", label: "Applications", module: "applications" },
  { href: "/admin/users", label: "Users", module: "users" },
  { href: "/admin/professionals", label: "Professionals", module: "professionals" },
  { href: "/admin/bookings", label: "Bookings", module: "bookings" },
  { href: "/admin/payouts", label: "Payouts", module: "payouts" },
  { href: "/admin/content", label: "Content", module: "content" },
  { href: "/admin/staff", label: "Staff & roles", module: "staff" },
  { href: "/admin/audit", label: "Audit log", module: "audit" },
];

const IDLE_MS = 15 * 60_000;

/** Signs staff out after 15 minutes without any activity. */
function useIdleSignOut() {
  useEffect(() => {
    let timer = setTimeout(signOut, IDLE_MS);
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(signOut, IDLE_MS);
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, []);
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AuthGate area="admin">
      <AdminFrame>{children}</AdminFrame>
    </AuthGate>
  );
}

function AdminFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const me = useMe();
  useIdleSignOut();
  const links = nav.filter((item) => me.modules.includes(item.module));
  const current = nav.filter((item) => (item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href))).pop();
  const isActive = (href: string) => current?.href === href;

  return (
    <div className="min-h-screen bg-wash lg:flex">
      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:flex-none lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:py-6">
          <Link href="/admin" className="flex min-h-10 items-center">
            <Image src="/brand/logo.svg" alt="Medico To Home" width={132} height={32} className="h-7 w-auto" unoptimized />
          </Link>
          <span className="text-xs text-muted">Admin</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:pb-0">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(item.href) ? "bg-navy font-normal text-white" : "text-body hover:bg-wash"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden p-4 lg:block">
          <div className="mb-2 truncate px-3 text-[13px] text-muted">{me.email}</div>
          <button onClick={signOut} className="min-h-10 w-full cursor-pointer rounded-lg px-3 text-left text-sm text-muted hover:bg-wash hover:text-navy">Log out</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-8">
        {current && !me.modules.includes(current.module) ? <p className="py-10 text-center text-sm text-muted">Your staff role does not include this section.</p> : children}
      </main>
    </div>
  );
}

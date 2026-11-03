"use client";

import { useState } from "react";

const HEIGHT = 200;

export function BookingsChart({ days: weeklyBookings }: { days: { day: string; count: number }[] }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...weeklyBookings.map((d) => d.count));
  const top = Math.max(5, Math.ceil(max / 5) * 5);

  return (
    <div className="px-5 py-4">
      <div className="mb-3 flex justify-end">
        <button onClick={() => setView(view === "chart" ? "table" : "chart")} className="min-h-9 cursor-pointer px-1 text-[13px] text-muted underline underline-offset-2 hover:text-navy">
          {view === "chart" ? "Show as table" : "Show as chart"}
        </button>
      </div>
      {view === "table" ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[12px] text-muted">
              <th scope="col" className="py-1.5 font-normal">Day</th>
              <th scope="col" className="py-1.5 text-right font-normal">Bookings</th>
            </tr>
          </thead>
          <tbody>
            {weeklyBookings.map((d) => (
              <tr key={d.day} className="border-t border-line-soft">
                <td className="py-1.5">{d.day}</td>
                <td className="py-1.5 text-right">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative mt-7">
          <div className="absolute inset-x-0 top-0 border-t border-line-soft" style={{ height: HEIGHT }}>
            <span className="absolute left-0 -top-5 text-[11px] text-faint">{top}</span>
          </div>
          <div className="relative flex items-end gap-0.5 border-b border-line" style={{ height: HEIGHT }}>
            {weeklyBookings.map((d, i) => (
              <button
                key={d.day}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${d.day}: ${d.count} bookings`}
                className="group relative flex h-full flex-1 cursor-default items-end justify-center bg-transparent"
              >
                <span
                  className={`block w-full max-w-11 rounded-t bg-navy transition-opacity ${active !== null && active !== i ? "opacity-40" : ""}`}
                  style={{ height: `${(d.count / top) * 100}%` }}
                />
                {active === i && (
                  <span
                    className="absolute z-10 whitespace-nowrap rounded-lg bg-navy px-2.5 py-1.5 text-xs text-white"
                    style={{ bottom: `calc(${(d.count / top) * 100}% + 8px)` }}
                  >
                    {d.day} · {d.count} bookings
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-0.5 text-center text-xs text-muted">
            {weeklyBookings.map((d) => (
              <span key={d.day} className="flex-1">
                {d.day}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

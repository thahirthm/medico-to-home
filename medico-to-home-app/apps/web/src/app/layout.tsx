import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Medico To Home — Care that comes home.", template: "%s · Medico To Home" },
  description: "Book verified doctors, nurses, therapists and caregivers at your doorstep across Kozhikode and Malappuram.",
  // iOS ignores SVG icons for "Add to Home Screen" and shows a letter instead, so it gets a PNG.
  icons: { icon: "/brand/icon.svg", apple: "/brand/apple-icon.png" },
  appleWebApp: { title: "Medico To Home" },
};

// Pinch-to-zoom stays on: no maximum-scale or user-scalable here.
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

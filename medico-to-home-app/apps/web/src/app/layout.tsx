import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Medico To Home — Care that comes home.", template: "%s · Medico To Home" },
  description: "Book verified doctors, nurses, therapists and caregivers at your doorstep across Kozhikode and Malappuram.",
  icons: { icon: "/brand/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

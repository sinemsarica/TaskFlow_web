import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-satoshi" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "TaskFlow — Kanban Board",
  description: "Simple, powerful kanban board for small teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${dmMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

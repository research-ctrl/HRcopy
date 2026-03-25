import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HR Legal Assistant",
  description: "Internal HR legal assistant scaffold for Portuguese workforce guidance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans text-slate-900 antialiased">{children}</body>
    </html>
  );
}


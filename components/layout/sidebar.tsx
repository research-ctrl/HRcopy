"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/chat", label: "Assistant" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/sources", label: "Sources" },
  { href: "/admin/runs", label: "Monitoring" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="panel subtle-grid sticky top-6 flex h-[calc(100vh-3rem)] flex-col justify-between overflow-hidden p-5">
      <div>
        <div className="rounded-2xl bg-slate-950 px-4 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Internal HR</p>
          <h1 className="mt-2 text-xl font-semibold">Legal Assistant</h1>
          <p className="mt-2 text-sm text-slate-300">Portuguese workforce guidance, governed sources, and review workflows.</p>
        </div>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Mode</p>
        <p className="mt-2 text-sm font-semibold text-slate-900">Local adapters active</p>
        <p className="mt-1 text-sm text-slate-600">Supabase and external providers are scaffolded, not connected.</p>
      </div>
    </aside>
  );
}

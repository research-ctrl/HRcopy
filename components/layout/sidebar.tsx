"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin",           label: "Overview",   icon: "dashboard"  as const, exact: true },
  { href: "/admin/knowledge", label: "Knowledge",  icon: "document"   as const },
  { href: "/admin/sources",   label: "Sources",    icon: "source"     as const },
  { href: "/admin/sync",      label: "Sync",       icon: "monitor"    as const },
  { href: "/admin/settings",  label: "Settings",   icon: "settings"   as const },
];

function NavLink({
  href,
  label,
  icon,
  active,
  compact = false,
}: {
  href: string;
  label: string;
  icon: (typeof navItems)[number]["icon"] | "chat";
  active: boolean;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Link
        href={href}
        className={cn(
          "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
          active ? "text-[color:var(--brand)]" : "text-[color:var(--muted)]",
        )}
      >
        <AppIcon name={icon} className="h-[22px] w-[22px]" />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)]"
          : "text-[color:var(--muted)] hover:bg-[color:var(--background)] hover:text-[color:var(--foreground)]",
      )}
    >
      <AppIcon
        name={icon}
        className={cn("h-[18px] w-[18px] shrink-0", active && "text-[color:var(--brand)]")}
      />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    // /admin/knowledge should NOT match /admin
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const mobileItems = [
    navItems[0], // Overview
    navItems[1], // Knowledge
    navItems[2], // Sources
    navItems[3], // Sync
    { href: "/chat", label: "Chat", icon: "chat" as const, exact: true },
  ];

  return (
    <>
      {/* ── Desktop left sidebar ───────────────────────────────── */}
      <aside className="hidden lg:flex w-[240px] shrink-0 flex-col bg-white border-r border-[color:var(--line)] h-screen sticky top-0 overflow-y-auto">
        {/* Brand mark */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[color:var(--line)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--brand)] text-white shrink-0">
            <AppIcon name="shield" className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--muted)]">Portugal HR</p>
            <p className="text-sm font-semibold text-[color:var(--foreground)] truncate">Legal Admin</p>
          </div>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(item.href, item.exact)}
            />
          ))}
        </nav>

        {/* Bottom: chat link + status */}
        <div className="border-t border-[color:var(--line)] px-3 py-4 space-y-1">
          <Link
            href="/chat"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              pathname.startsWith("/chat")
                ? "bg-[color:var(--brand)] text-white"
                : "text-[color:var(--muted)] hover:bg-[color:var(--background)] hover:text-[color:var(--foreground)]",
            )}
          >
            <AppIcon name="chat" className="h-[18px] w-[18px] shrink-0" />
            Open Chat
          </Link>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ──────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[color:var(--line)] flex items-stretch">
        {mobileItems.map((item) => {
          const active = item.href === "/chat"
            ? pathname.startsWith("/chat")
            : item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={active}
              compact
            />
          );
        })}
      </nav>
    </>
  );
}

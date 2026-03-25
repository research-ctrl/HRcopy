"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils";

export function Drawer({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
      <button aria-label="Close drawer" className="absolute inset-0 cursor-default" onClick={onClose} />
      <aside className={cn("relative flex h-full w-full max-w-xl flex-col bg-white shadow-xl")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[color:var(--line)] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[color:var(--foreground)]">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-sm text-[color:var(--muted)]">{description}</p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-[color:var(--background)] transition-colors"
          >
            <AppIcon name="x" className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>
      </aside>
    </div>
  );
}

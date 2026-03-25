"use client";

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
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-sm">
      <button aria-label="Close drawer" className="absolute inset-0 cursor-default" onClick={onClose} />
      <aside className={cn("relative h-full w-full max-w-xl overflow-y-auto bg-[var(--background)] p-6 shadow-2xl")}>
        <div className="panel min-h-full p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
              {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
            </div>
            <button className="rounded-2xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-100" onClick={onClose}>
              Close
            </button>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </aside>
    </div>
  );
}


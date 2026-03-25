export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 text-sm text-[color:var(--muted)]">
      <span className="h-2 w-2 animate-pulse rounded-full bg-[color:var(--brand)]" />
      {label}
    </div>
  );
}

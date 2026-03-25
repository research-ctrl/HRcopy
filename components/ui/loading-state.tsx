export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-600">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-500" />
      {label}
    </div>
  );
}

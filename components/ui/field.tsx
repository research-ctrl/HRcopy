export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-[color:var(--foreground)]">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-[color:var(--muted)]">{hint}</span> : null}
    </label>
  );
}

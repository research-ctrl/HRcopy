export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[color:var(--line)] bg-[color:var(--background)] px-6 py-10 text-center">
      <h3 className="text-sm font-semibold text-[color:var(--foreground)]">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-xs text-sm text-[color:var(--muted)]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

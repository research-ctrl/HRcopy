export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--muted)]">
        {eyebrow}
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
        {title}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-[color:var(--muted)]">{description}</p>
    </div>
  );
}

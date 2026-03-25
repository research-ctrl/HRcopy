import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  eyebrow,
  description,
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-[color:var(--line)] bg-white p-5", className)}>
      <div className="mb-4">
        {eyebrow ? (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--muted)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-base font-semibold text-[color:var(--foreground)]">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-[color:var(--muted)]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

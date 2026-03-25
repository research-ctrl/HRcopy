import { cn } from "@/lib/utils";

export function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  const variantMap = {
    primary:
      "bg-[color:var(--brand)] text-white hover:bg-[color:var(--brand-strong)] disabled:bg-[color:var(--background)] disabled:text-[color:var(--muted)]",
    secondary:
      "border border-[color:var(--line)] bg-white text-[color:var(--foreground)] hover:bg-[color:var(--background)] disabled:text-[color:var(--muted)]",
    ghost:
      "bg-transparent text-[color:var(--muted)] hover:bg-[color:var(--background)] hover:text-[color:var(--foreground)]",
    danger: "bg-rose-600 text-white hover:bg-rose-500 disabled:bg-rose-300",
  } as const;

  const sizeMap = {
    sm: "h-8 px-3.5 text-xs",
    md: "h-9 px-4 text-sm",
  } as const;

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/30 disabled:cursor-not-allowed",
        variantMap[variant],
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

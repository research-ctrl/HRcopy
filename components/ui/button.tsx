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
    primary: "bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-400",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 disabled:text-slate-400",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-500 disabled:bg-rose-300",
  } as const;

  const sizeMap = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
  } as const;

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed",
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


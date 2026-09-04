export type ButtonVariant = "ghost" | "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonStyleOptions {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-950 disabled:hover:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:disabled:hover:bg-transparent",
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400 dark:active:bg-blue-300",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:border-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export function buttonStyles({
  className = "",
  size = "md",
  variant = "primary",
}: ButtonStyleOptions = {}): string {
  return `inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-slate-950 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
}

interface SpinnerProps {
  className?: string;
  label?: string;
  size?: "sm" | "md";
}

function Spinner({ className = "", label, size = "md" }: SpinnerProps) {
  const sizeClass = size === "sm" ? "size-4" : "size-5";

  return (
    <span
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${sizeClass} ${className}`}
      role={label ? "status" : undefined}
    />
  );
}

export default Spinner;

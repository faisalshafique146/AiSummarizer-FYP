import type { ReactNode } from "react";

interface AlertProps {
  children: ReactNode;
  className?: string;
  title?: string;
  tone?: "error" | "info";
}

function Alert({
  children,
  className = "",
  title,
  tone = "error",
}: AlertProps) {
  const toneClasses =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-900"
      : "border-blue-200 bg-blue-50 text-blue-950";

  return (
    <div
      className={`break-words rounded-md border px-4 py-3 text-sm ${toneClasses} ${className}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? "mt-1 text-current/80" : ""}>{children}</div>
    </div>
  );
}

export default Alert;

import type { ComponentPropsWithoutRef } from "react";

function Panel({ className = "", ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      {...props}
      className={`rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${className}`}
    />
  );
}

export default Panel;

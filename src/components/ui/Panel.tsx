import type { ComponentPropsWithoutRef } from "react";

function Panel({ className = "", ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      {...props}
      className={`rounded-lg border border-slate-200 bg-white ${className}`}
    />
  );
}

export default Panel;

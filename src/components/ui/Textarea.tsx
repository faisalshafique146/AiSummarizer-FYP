import { forwardRef, type ComponentPropsWithoutRef } from "react";

const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithoutRef<"textarea">
>(function Textarea({ className = "", ...props }, ref) {
  return (
    <textarea
      {...props}
      className={`w-full resize-y rounded-md border border-slate-300 bg-white px-4 py-3.5 text-[15px] leading-7 text-slate-900 outline-none transition placeholder:text-slate-500 hover:border-slate-500 focus-visible:border-blue-600 focus-visible:ring-3 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-500 dark:focus-visible:border-blue-400 dark:focus-visible:ring-blue-950 dark:disabled:bg-slate-800 ${className}`}
      ref={ref}
    />
  );
});

export default Textarea;

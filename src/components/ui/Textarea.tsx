import { forwardRef, type ComponentPropsWithoutRef } from "react";

const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithoutRef<"textarea">
>(function Textarea({ className = "", ...props }, ref) {
  return (
    <textarea
      {...props}
      className={`w-full resize-y rounded-md border border-slate-300 bg-white px-4 py-3.5 text-[15px] leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-500 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 ${className}`}
      ref={ref}
    />
  );
});

export default Textarea;

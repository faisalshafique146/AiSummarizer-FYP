import { forwardRef, type ComponentPropsWithoutRef } from "react";

const Input = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        {...props}
        className={`min-h-11 w-full rounded-md border border-slate-300 bg-white px-3.5 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-500 hover:border-slate-500 focus-visible:border-blue-600 focus-visible:ring-3 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-500 dark:focus-visible:border-blue-400 dark:focus-visible:ring-blue-950 dark:disabled:bg-slate-800 ${className}`}
        ref={ref}
      />
    );
  },
);

export default Input;

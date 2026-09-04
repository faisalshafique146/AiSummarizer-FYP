import { forwardRef, type ComponentPropsWithoutRef } from "react";

const Input = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        {...props}
        className={`min-h-11 w-full rounded-md border border-slate-300 bg-white px-3.5 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-500 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 ${className}`}
        ref={ref}
      />
    );
  },
);

export default Input;

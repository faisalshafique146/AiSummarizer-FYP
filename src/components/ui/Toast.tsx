interface ToastProps {
  message: string;
  onDismiss: () => void;
  tone?: "error" | "success";
}

function Toast({ message, onDismiss, tone = "success" }: ToastProps) {
  const toneClasses =
    tone === "success"
      ? "border-slate-800 bg-slate-950 text-white"
      : "border-red-700 bg-red-700 text-white";

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 flex max-w-sm items-center gap-3 rounded-md border px-4 py-3 text-sm shadow-lg sm:right-6 sm:bottom-6 ${toneClasses}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <span
        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs"
        aria-hidden="true"
      >
        {tone === "success" ? "\u2713" : "!"}
      </span>
      <p>{message}</p>
      <button
        aria-label="Dismiss notification"
        className="ml-1 rounded p-1 text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        onClick={onDismiss}
        type="button"
      >
        {"\u00d7"}
      </button>
    </div>
  );
}

export default Toast;

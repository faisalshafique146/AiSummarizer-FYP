import { useEffect, useId, type MouseEventHandler, type ReactNode } from "react";

interface AuthDialogProps {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}

function AuthDialog({
  title,
  description,
  onClose,
  children,
}: AuthDialogProps) {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleBackdropClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 id={titleId} className="text-2xl font-semibold text-gray-900">
              {title}
            </h1>
            <p className="mt-2 text-sm text-gray-600">{description}</p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            className="rounded-md px-2 py-1 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default AuthDialog;

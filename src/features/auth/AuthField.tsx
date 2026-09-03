import type { UseFormRegisterReturn } from "react-hook-form";

interface AuthFieldProps {
  autoComplete: string;
  autoFocus?: boolean;
  error: string | undefined;
  hint?: string;
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  type: "email" | "password" | "text";
}

function AuthField({
  autoComplete,
  autoFocus = false,
  error,
  hint,
  id,
  label,
  registration,
  type,
}: AuthFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter((value) => value !== null)
    .join(" ");

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-800" htmlFor={id}>
        {label}
      </label>
      <input
        {...registration}
        aria-describedby={describedBy || undefined}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={`rounded-lg border px-3 py-3 font-normal outline-none focus:border-gray-700 ${
          error ? "border-red-700" : "border-gray-300"
        }`}
        id={id}
        required
        type={type}
      />
      {hint ? (
        <p className="text-xs text-gray-600" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-800" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default AuthField;

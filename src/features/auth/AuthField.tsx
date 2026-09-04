import type { UseFormRegisterReturn } from "react-hook-form";
import Input from "../../components/ui/Input";

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
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor={id}>
        {label}
      </label>
      <Input
        {...registration}
        aria-describedby={describedBy || undefined}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={
          error
            ? "border-red-500 focus-visible:border-red-600 focus-visible:ring-red-100"
            : ""
        }
        id={id}
        required
        type={type}
      />
      {hint ? (
        <p className="mt-2 text-xs leading-5 text-slate-500" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-red-700" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default AuthField;

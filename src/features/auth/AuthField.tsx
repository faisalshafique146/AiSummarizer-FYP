import { useState } from "react";
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

interface VisibilityIconProps {
  visible: boolean;
}

function VisibilityIcon({ visible }: VisibilityIconProps) {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M2.75 12s3.25-5.25 9.25-5.25S21.25 12 21.25 12 18 17.25 12 17.25 2.75 12 2.75 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      {visible ? (
        <path
          d="m4 4 16 16"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      ) : null}
    </svg>
  );
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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const isPasswordField = type === "password";
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter((value) => value !== null)
    .join(" ");
  const inputClassName = [
    isPasswordField ? "pr-12" : "",
    error
      ? "border-red-500 focus-visible:border-red-600 focus-visible:ring-red-100"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Input
          {...registration}
          aria-describedby={describedBy || undefined}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={inputClassName}
          id={id}
          required
          type={isPasswordField && passwordVisible ? "text" : type}
        />
        {isPasswordField ? (
          <button
            aria-controls={id}
            aria-label={`${passwordVisible ? "Hide" : "Show"} ${label.toLowerCase()}`}
            aria-pressed={passwordVisible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
            onClick={() => {
              setPasswordVisible((visible) => !visible);
            }}
            type="button"
          >
            <VisibilityIcon visible={passwordVisible} />
          </button>
        ) : null}
      </div>
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

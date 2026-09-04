import type { ButtonHTMLAttributes } from "react";
import Spinner from "./Spinner";
import {
  buttonStyles,
  type ButtonSize,
  type ButtonVariant,
} from "./buttonStyles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingLabel?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

function Button({
  children,
  className = "",
  disabled,
  isLoading = false,
  loadingLabel = "Working...",
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      aria-busy={isLoading}
      className={buttonStyles({ className, size, variant })}
      disabled={isLoading ? true : disabled}
      type={type}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;

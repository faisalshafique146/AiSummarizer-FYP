import {
  useState,
  type ChangeEventHandler,
  type SubmitEventHandler,
} from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router";
import { getAuthErrorMessage } from "../authErrors";
import { auth } from "../firebase";
import type { SignInFormValues } from "../types";
import AuthDialog from "./AuthDialog";

interface SigninModalProps {
  onClose?: () => void;
}

function SigninModal({ onClose }: SigninModalProps) {
  const navigate = useNavigate();
  const [values, setValues] = useState<SignInFormValues>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleClose = (): void => {
    if (onClose) {
      onClose();
    } else {
      void navigate("/");
    }
  };

  const handleEmailChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValues((current) => ({ ...current, email: event.target.value }));
  };

  const handlePasswordChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setValues((current) => ({ ...current, password: event.target.value }));
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setError("");

    if (!values.email || !values.password) {
      setError("Please fill all the fields");
      return;
    }

    if (!values.email.includes("@")) {
      setError("Invalid Email");
      return;
    }

    void signInWithEmailAndPassword(auth, values.email, values.password)
      .then(() => navigate("/"))
      .catch((caughtError: unknown) => {
        setError(getAuthErrorMessage(caughtError));
      });
  };

  return (
    <AuthDialog
      title="Sign In"
      description="Enter your email and password to Sign In."
      onClose={handleClose}
    >
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-800">
          Your Email
          <input
            autoComplete="email"
            className="rounded-lg border border-gray-300 px-3 py-3 font-normal outline-none focus:border-gray-700"
            onChange={handleEmailChange}
            type="email"
            value={values.email}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-800">
          Your Password
          <input
            autoComplete="current-password"
            className="rounded-lg border border-gray-300 px-3 py-3 font-normal outline-none focus:border-gray-700"
            onChange={handlePasswordChange}
            type="password"
            value={values.password}
          />
        </label>
        {error && (
          <p className="text-sm text-red-800" role="alert">
            {error}
          </p>
        )}
        <button
          className="rounded-lg bg-linear-to-r from-gray-900 to-gray-700 px-4 py-3 font-semibold text-white"
          type="submit"
        >
          Sign In
        </button>
        <p className="text-center text-sm text-gray-700">
          Don&apos;t have an account?
          <Link to="/SignupModal" className="ml-1 font-bold text-gray-900">
            Sign up
          </Link>
        </p>
      </form>
    </AuthDialog>
  );
}

export default SigninModal;

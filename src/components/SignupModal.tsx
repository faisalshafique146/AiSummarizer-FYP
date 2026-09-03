import {
  useState,
  type ChangeEventHandler,
  type SubmitEventHandler,
} from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router";
import { getAuthErrorMessage } from "../authErrors";
import { auth } from "../firebase";
import type { SignUpFormValues } from "../types";
import AuthDialog from "./AuthDialog";

interface SignupModalProps {
  onClose?: () => void;
}

function SignupModal({ onClose }: SignupModalProps) {
  const navigate = useNavigate();
  const [values, setValues] = useState<SignUpFormValues>({
    name: "",
    email: "",
    password: "",
    repeatedPassword: "",
  });
  const [error, setError] = useState("");

  const handleClose = (): void => {
    if (onClose) {
      onClose();
    } else {
      void navigate("/");
    }
  };

  const handleNameChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValues((current) => ({ ...current, name: event.target.value }));
  };

  const handleEmailChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValues((current) => ({ ...current, email: event.target.value }));
  };

  const handlePasswordChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setValues((current) => ({ ...current, password: event.target.value }));
  };

  const handleRepeatedPasswordChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setValues((current) => ({
      ...current,
      repeatedPassword: event.target.value,
    }));
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setError("");

    if (
      !values.name ||
      !values.email ||
      !values.password ||
      !values.repeatedPassword
    ) {
      setError("Please fill all the fields");
      return;
    }

    if (values.password !== values.repeatedPassword) {
      setError("Passwords do not match");
      return;
    }

    if (values.password.length < 6) {
      setError("Password should be at least 6 characters long");
      return;
    }

    if (!values.email.includes("@")) {
      setError("Invalid Email");
      return;
    }

    void createUserWithEmailAndPassword(auth, values.email, values.password)
      .then(({ user }) => updateProfile(user, { displayName: values.name }))
      .then(handleClose)
      .catch((caughtError: unknown) => {
        setError(getAuthErrorMessage(caughtError));
      });
  };

  return (
    <AuthDialog
      title="Sign Up"
      description="Enter your details to Sign Up."
      onClose={handleClose}
    >
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-800">
          Your Name
          <input
            autoComplete="name"
            className="rounded-lg border border-gray-300 px-3 py-3 font-normal outline-none focus:border-gray-700"
            onChange={handleNameChange}
            type="text"
            value={values.name}
          />
        </label>
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
            autoComplete="new-password"
            className="rounded-lg border border-gray-300 px-3 py-3 font-normal outline-none focus:border-gray-700"
            onChange={handlePasswordChange}
            type="password"
            value={values.password}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-800">
          Rewrite Password
          <input
            autoComplete="new-password"
            className="rounded-lg border border-gray-300 px-3 py-3 font-normal outline-none focus:border-gray-700"
            onChange={handleRepeatedPasswordChange}
            type="password"
            value={values.repeatedPassword}
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
          Sign Up
        </button>
      </form>
    </AuthDialog>
  );
}

export default SignupModal;

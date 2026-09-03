import {
  useState,
  type ChangeEventHandler,
  type SubmitEventHandler,
} from "react";
import { Navigate, useNavigate } from "react-router";
import { getAuthErrorMessage } from "./authErrors";
import AuthPageLayout from "./AuthPageLayout";
import type { SignUpFormValues } from "./types";
import { useAuth } from "./useAuth";

function SignUpPage() {
  const navigate = useNavigate();
  const { user, loading, signUp } = useAuth();
  const [values, setValues] = useState<SignUpFormValues>({
    name: "",
    email: "",
    password: "",
    repeatedPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const submitDetails = async (): Promise<void> => {
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

    try {
      setSubmitting(true);
      await signUp({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      void navigate("/");
    } catch (caughtError: unknown) {
      setError(getAuthErrorMessage(caughtError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void submitDetails();
  };

  if (loading) {
    return (
      <AuthPageLayout
        title="Checking your session"
        description="Please wait while HiSumz restores your account."
      >
        <p className="mt-6 text-sm text-gray-700" role="status">
          Loading…
        </p>
      </AuthPageLayout>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthPageLayout
      title="Sign Up"
      description="Enter your details to create an account."
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
          className="rounded-lg bg-linear-to-r from-gray-900 to-gray-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Creating Account…" : "Sign Up"}
        </button>
      </form>
    </AuthPageLayout>
  );
}

export default SignUpPage;

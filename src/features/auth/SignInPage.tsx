import {
  useState,
  type ChangeEventHandler,
  type SubmitEventHandler,
} from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { getAuthErrorMessage } from "./authErrors";
import AuthPageLayout from "./AuthPageLayout";
import type { SignInCredentials } from "./types";
import { useAuth } from "./useAuth";

function SignInPage() {
  const navigate = useNavigate();
  const { user, loading, signIn } = useAuth();
  const [values, setValues] = useState<SignInCredentials>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleEmailChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValues((current) => ({ ...current, email: event.target.value }));
  };

  const handlePasswordChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setValues((current) => ({ ...current, password: event.target.value }));
  };

  const submitCredentials = async (): Promise<void> => {
    setError("");

    if (!values.email || !values.password) {
      setError("Please fill all the fields");
      return;
    }

    if (!values.email.includes("@")) {
      setError("Invalid Email");
      return;
    }

    try {
      setSubmitting(true);
      await signIn(values);
      void navigate("/");
    } catch (caughtError: unknown) {
      setError(getAuthErrorMessage(caughtError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void submitCredentials();
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
      title="Sign In"
      description="Enter your email and password to Sign In."
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
          className="rounded-lg bg-linear-to-r from-gray-900 to-gray-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Signing In…" : "Sign In"}
        </button>
        <p className="text-center text-sm text-gray-700">
          Don&apos;t have an account?
          <Link to="/sign-up" className="ml-1 font-bold text-gray-900">
            Sign up
          </Link>
        </p>
      </form>
    </AuthPageLayout>
  );
}

export default SignInPage;

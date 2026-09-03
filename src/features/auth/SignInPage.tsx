import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitEventHandler } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { getAuthErrorMessage } from "./authErrors";
import AuthField from "./AuthField";
import AuthPageLayout from "./AuthPageLayout";
import {
  signInSchema,
  type SignInFormValues,
} from "./authSchemas";
import { useAuth } from "./useAuth";

function SignInPage() {
  const navigate = useNavigate();
  const { user, loading, signIn } = useAuth();
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<SignInFormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
    resolver: zodResolver(signInSchema),
  });

  const submitCredentials: SubmitHandler<SignInFormValues> = async (values) => {
    clearErrors("root");

    try {
      await signIn(values);
      void navigate("/", { replace: true });
    } catch (error: unknown) {
      setError("root", {
        message: getAuthErrorMessage(error),
        type: "server",
      });
    }
  };

  const handleFormSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    void handleSubmit(submitCredentials)(event);
  };

  if (loading) {
    return (
      <AuthPageLayout
        title="Checking your session"
        description="Please wait while HiSumz restores your account."
      >
        <p className="mt-6 text-sm text-gray-700" role="status">
          Loading&hellip;
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
      description="Enter your email and password to sign in."
    >
      <form
        aria-busy={isSubmitting}
        className="mt-6 flex flex-col gap-4"
        noValidate
        onSubmit={handleFormSubmit}
      >
        <AuthField
          autoComplete="username"
          autoFocus
          error={errors.email?.message}
          id="sign-in-email"
          label="Email"
          registration={register("email")}
          type="email"
        />
        <AuthField
          autoComplete="current-password"
          error={errors.password?.message}
          id="sign-in-password"
          label="Password"
          registration={register("password")}
          type="password"
        />
        {errors.root?.message ? (
          <p className="text-sm text-red-800" role="alert">
            {errors.root.message}
          </p>
        ) : null}
        <button
          className="rounded-lg bg-linear-to-r from-gray-900 to-gray-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Signing In…" : "Sign In"}
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

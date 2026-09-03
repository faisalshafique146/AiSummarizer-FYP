import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitEventHandler } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { getAuthErrorMessage } from "./authErrors";
import AuthField from "./AuthField";
import AuthPageLayout from "./AuthPageLayout";
import {
  signUpSchema,
  type SignUpFormValues,
} from "./authSchemas";
import { useAuth } from "./useAuth";

function SignUpPage() {
  const navigate = useNavigate();
  const { user, loading, signUp } = useAuth();
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<SignUpFormValues>({
    defaultValues: {
      confirmPassword: "",
      displayName: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
    resolver: zodResolver(signUpSchema),
  });

  const submitDetails: SubmitHandler<SignUpFormValues> = async (values) => {
    clearErrors("root");

    try {
      await signUp({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
      });
      void navigate("/", { replace: true });
    } catch (error: unknown) {
      setError("root", {
        message: getAuthErrorMessage(error),
        type: "server",
      });
    }
  };

  const handleFormSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    void handleSubmit(submitDetails)(event);
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
      title="Sign Up"
      description="Enter your details to create an account."
    >
      <form
        aria-busy={isSubmitting}
        className="mt-6 flex flex-col gap-4"
        noValidate
        onSubmit={handleFormSubmit}
      >
        <AuthField
          autoComplete="name"
          autoFocus
          error={errors.displayName?.message}
          id="sign-up-display-name"
          label="Display name"
          registration={register("displayName")}
          type="text"
        />
        <AuthField
          autoComplete="email"
          error={errors.email?.message}
          id="sign-up-email"
          label="Email"
          registration={register("email")}
          type="email"
        />
        <AuthField
          autoComplete="new-password"
          error={errors.password?.message}
          hint="Use at least 8 characters."
          id="sign-up-password"
          label="Password"
          registration={register("password")}
          type="password"
        />
        <AuthField
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          id="sign-up-confirm-password"
          label="Confirm password"
          registration={register("confirmPassword")}
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
          {isSubmitting ? "Creating Account…" : "Create Account"}
        </button>
        <p className="text-center text-sm text-gray-700">
          Already have an account?
          <Link to="/sign-in" className="ml-1 font-bold text-gray-900">
            Sign in
          </Link>
        </p>
      </form>
    </AuthPageLayout>
  );
}

export default SignUpPage;

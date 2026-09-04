import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitEventHandler } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { getAuthErrorMessage } from "./authErrors";
import AuthField from "./AuthField";
import AuthPageLayout from "./AuthPageLayout";
import { signUpSchema, type SignUpFormValues } from "./authSchemas";
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
        <div className="mt-8 flex items-center gap-3 text-sm text-slate-600" role="status">
          <Spinner />
          Loading your account...
        </div>
      </AuthPageLayout>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthPageLayout
      title="Create your account"
      description="Set up your account to start summarizing text."
    >
      <form
        aria-busy={isSubmitting}
        className="mt-8 flex flex-col gap-5"
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
          label="Email address"
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
        {errors.root?.message ? <Alert>{errors.root.message}</Alert> : null}
        <Button
          className="mt-1 w-full"
          isLoading={isSubmitting}
          loadingLabel="Creating account..."
          size="lg"
          type="submit"
        >
          Create account
        </Button>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            className="font-semibold text-blue-700 hover:text-blue-800 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            to="/sign-in"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthPageLayout>
  );
}

export default SignUpPage;

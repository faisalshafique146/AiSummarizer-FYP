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
import { signInSchema, type SignInFormValues } from "./authSchemas";
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
        <div className="mt-8 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400" role="status">
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
      title="Welcome back"
      description="Sign in to open your summarizer workspace."
    >
      <form
        aria-busy={isSubmitting}
        className="mt-8 flex flex-col gap-5"
        noValidate
        onSubmit={handleFormSubmit}
      >
        <AuthField
          autoComplete="username"
          autoFocus
          error={errors.email?.message}
          id="sign-in-email"
          label="Email address"
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
        {errors.root?.message ? <Alert>{errors.root.message}</Alert> : null}
        <Button
          className="mt-1 w-full"
          isLoading={isSubmitting}
          loadingLabel="Signing in..."
          size="lg"
          type="submit"
        >
          Sign in
        </Button>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          New to HiSumz?{" "}
          <Link
            className="font-semibold text-blue-700 hover:text-blue-800 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            to="/sign-up"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthPageLayout>
  );
}

export default SignInPage;

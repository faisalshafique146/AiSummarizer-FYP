import { useState, type MouseEventHandler } from "react";
import { Link } from "react-router";
import { getAuthErrorMessage } from "../features/auth/authErrors";
import { useAuth } from "../features/auth/useAuth";
import Brand from "./Brand";
import ThemeToggle from "./ThemeToggle";
import Button from "./ui/Button";
import { buttonStyles } from "./ui/buttonStyles";
import Toast from "./ui/Toast";

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "H";
}

function AppHeader() {
  const { user, loading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const submitSignOut = async (): Promise<void> => {
    setIsSigningOut(true);
    setSignOutError(null);

    try {
      await signOut();
    } catch (error: unknown) {
      setSignOutError(getAuthErrorMessage(error));
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSignOut: MouseEventHandler<HTMLButtonElement> = () => {
    void submitSignOut();
  };

  const identity = user?.displayName ?? user?.email ?? "Account";

  return (
    <>
      <header className="border-b border-slate-300 bg-[#f8f8f6] dark:border-slate-800 dark:bg-[#0b0f14]">
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8"
        >
          <Link
            aria-label="HiSumz home"
            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            to="/"
          >
            <Brand />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {loading ? (
              <div
                aria-label="Checking session"
                className="h-9 w-28 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800"
                role="status"
              />
            ) : null}

            {!loading && !user ? (
              <>
                <Link
                  className={buttonStyles({ variant: "ghost" })}
                  to="/sign-in"
                >
                  Sign in
                </Link>
                <Link
                  className={buttonStyles({ variant: "primary" })}
                  to="/sign-up"
                >
                  <span className="sm:hidden">Sign up</span>
                  <span className="hidden sm:inline">Create account</span>
                </Link>
              </>
            ) : null}

            {!loading && user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden text-right sm:block">
                  <p className="max-w-44 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {identity}
                  </p>
                  {user.displayName && user.email ? (
                    <p className="max-w-44 truncate text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  ) : null}
                </div>
                <span
                  aria-hidden="true"
                  className="flex size-9 items-center justify-center rounded-md border border-slate-300 bg-white text-sm font-bold text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-400"
                >
                  {getInitial(identity)}
                </span>
                <Button
                  aria-label="Sign out of HiSumz"
                  isLoading={isSigningOut}
                  loadingLabel="Signing out"
                  onClick={handleSignOut}
                  size="sm"
                  variant="secondary"
                >
                  Sign out
                </Button>
              </div>
            ) : null}
          </div>
        </nav>
      </header>

      {signOutError ? (
        <Toast
          message={signOutError}
          onDismiss={() => {
            setSignOutError(null);
          }}
          tone="error"
        />
      ) : null}
    </>
  );
}

export default AppHeader;

import { useState, type MouseEventHandler } from "react";
import { Link } from "react-router";
import { logo } from "../assets";
import { getAuthErrorMessage } from "../features/auth/authErrors";
import { useAuth } from "../features/auth/useAuth";

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

  return (
    <header className="flex w-full flex-col items-center justify-center">
      <nav className="mb-10 flex w-full items-center pt-3">
        <Link to="/" aria-label="HiSumz home">
          <img src={logo} alt="HiSumz logo" className="w-28 object-contain" />
        </Link>

        {!loading && !user && (
          <>
            <Link to="/sign-in" className="black_btn ml-auto">
              Sign In
            </Link>
            <Link to="/sign-up" className="black_btn ml-2">
              Sign Up
            </Link>
          </>
        )}
        {!loading && user && (
          <div className="ml-auto flex items-center gap-3">
            {signOutError ? (
              <p className="text-sm text-red-800" role="alert">
                {signOutError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleSignOut}
              className="black_btn disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSigningOut}
              title={user.displayName ?? user.email ?? "Authenticated user"}
            >
              {isSigningOut ? "Signing Out…" : "Sign Out"}
            </button>
          </div>
        )}
      </nav>

      <h1 className="head_text">
        Summarize Articles with <br className="max-md:hidden" />
        <span className="orange_gradient">HiSumz AI</span>
      </h1>
      <h2 className="desc">
        Simplify your reading with HiSumz, an open-source article summarizer
        that transforms lengthy articles into clear and concise summaries
      </h2>
    </header>
  );
}

export default AppHeader;

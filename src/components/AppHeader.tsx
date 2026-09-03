import type { MouseEventHandler } from "react";
import { Link } from "react-router";
import { logo } from "../assets";
import { useAuth } from "../features/auth/useAuth";

function AppHeader() {
  const { user, loading, signOut } = useAuth();

  const handleSignOut: MouseEventHandler<HTMLButtonElement> = () => {
    void signOut().catch((error: unknown) => {
      console.error("Failed to sign out:", error);
    });
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
          <button
            type="button"
            onClick={handleSignOut}
            className="black_btn ml-auto"
            title={user.displayName ?? user.email ?? "Authenticated user"}
          >
            Sign Out
          </button>
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

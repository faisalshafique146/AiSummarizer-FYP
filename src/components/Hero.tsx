import type { MouseEventHandler } from "react";
import { Link } from "react-router";
import { logo } from "../assets";
import type { AuthenticatedUser } from "../types";

interface HeroProps {
  user: AuthenticatedUser | null;
  onLogout: () => Promise<void>;
}

function Hero({ user, onLogout }: HeroProps) {
  const handleLogout: MouseEventHandler<HTMLButtonElement> = () => {
    void onLogout();
  };

  return (
    <header className="flex w-full flex-col items-center justify-center">
      <nav className="mb-10 flex w-full items-center pt-3">
        <img src={logo} alt="HiSumz logo" className="w-28 object-contain" />

        {!user && (
          <>
            <Link to="/SigninModal" className="black_btn ml-auto">
              Sign In
            </Link>
            <Link to="/SignupModal" className="black_btn ml-2">
              Sign Up
            </Link>
          </>
        )}
        {user && (
          <button
            type="button"
            onClick={handleLogout}
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

export default Hero;

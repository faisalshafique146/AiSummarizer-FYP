import AppHeader from "../components/AppHeader";
import { useAuth } from "../features/auth/useAuth";
import SummarizerWorkspace from "../features/summarizer/SummarizerWorkspace";

function HomePage() {
  const { user, loading } = useAuth();

  return (
    <main>
      <div className="main" aria-hidden="true">
        <div className="gradient" />
      </div>
      <div className="app">
        <AppHeader />
        {loading ? (
          <p
            className="h-[600px] pt-9 text-2xl font-semibold text-gray-700"
            role="status"
          >
            Checking your session…
          </p>
        ) : user ? (
          <SummarizerWorkspace />
        ) : (
          <p className="orange_gradient h-[600px] pt-9 text-5xl font-bold">
            Please Sign in To Summarize
          </p>
        )}
      </div>
    </main>
  );
}

export default HomePage;

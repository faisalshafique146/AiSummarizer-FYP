import AppHeader from "../components/AppHeader";
import SignedOutLanding from "../components/SignedOutLanding";
import Panel from "../components/ui/Panel";
import { useAuth } from "../features/auth/useAuth";
import SummarizerWorkspace from "../features/summarizer/SummarizerWorkspace";

function WorkspaceLoadingState() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-5 h-10 w-full max-w-lg animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-6 w-full max-w-2xl animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
      <Panel className="mt-10 grid min-h-80 animate-pulse gap-px overflow-hidden bg-slate-200 sm:min-h-96 lg:grid-cols-2 dark:bg-slate-700">
        <div className="bg-white dark:bg-slate-900" />
        <div className="bg-slate-50 dark:bg-slate-800" />
      </Panel>
      <span className="sr-only" role="status">
        Checking your session
      </span>
    </div>
  );
}

function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8f8f6] text-slate-950 dark:bg-[#0b0f14] dark:text-slate-100">
      <AppHeader />
      <main id="main-content">
        {loading ? <WorkspaceLoadingState /> : null}
        {!loading && !user ? <SignedOutLanding /> : null}
        {!loading && user ? (
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <section className="max-w-3xl border-l-2 border-blue-600 pl-5 sm:pl-6 dark:border-blue-400">
              <p className="font-mono text-xs tracking-[0.14em] text-blue-700 uppercase dark:text-blue-400">
                Workspace / New summary
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-slate-50">
                Create a new summary.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                Paste the source on the left. Your summary will stay beside it
                for an easier review.
              </p>
            </section>
            <div className="mt-8 sm:mt-10">
              <SummarizerWorkspace />
            </div>
          </div>
        ) : null}
      </main>
      <footer className="border-t border-slate-300 bg-[#f8f8f6] dark:border-slate-800 dark:bg-[#0b0f14]">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 text-sm text-slate-500 sm:px-6 lg:px-8 dark:text-slate-500">
          <p>HiSumz / Text summarizer</p>
          <p className="hidden font-mono text-xs tracking-wide sm:block">ONE TASK. NO CLUTTER.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;

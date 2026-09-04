import type { ReactNode } from "react";
import { Link } from "react-router";
import Brand from "../../components/Brand";
import ThemeToggle from "../../components/ThemeToggle";

interface AuthPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

function AuthPageLayout({
  title,
  description,
  children,
}: AuthPageLayoutProps) {
  return (
    <main
      className="grid min-h-screen bg-[#f8f8f6] text-slate-950 lg:grid-cols-[320px_minmax(0,1fr)] dark:bg-[#0b0f14] dark:text-slate-100"
      id="main-content"
    >
      <aside className="hidden border-r border-slate-300 p-8 lg:flex lg:flex-col xl:p-10 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <Link
            aria-label="HiSumz home"
            className="w-fit rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-slate-950"
            to="/"
          >
            <Brand />
          </Link>
          <ThemeToggle />
        </div>

        <div className="my-auto py-16">
          <p className="font-mono text-xs tracking-[0.16em] text-blue-700 uppercase dark:text-blue-400">
            One focused workflow
          </p>
          <p className="mt-5 text-2xl leading-9 font-semibold tracking-[-0.035em] text-slate-950 dark:text-slate-100">
            Paste source text.
            <br />
            Generate a summary.
            <br />
            Review and copy.
          </p>
          <div className="mt-10 flex items-center gap-2" aria-hidden="true">
            <span className="h-px w-12 bg-blue-600 dark:bg-blue-400" />
            <span className="size-1.5 bg-blue-600 dark:bg-blue-400" />
            <span className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
          </div>
        </div>

        <Link
          className="w-fit rounded text-sm text-slate-600 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:text-white dark:focus-visible:ring-offset-slate-950"
          to="/"
        >
          &larr; Return to HiSumz
        </Link>
      </aside>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-[430px]">
          <div className="mb-12 flex items-center justify-between gap-3 lg:hidden">
            <Link
              aria-label="HiSumz home"
              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              to="/"
            >
              <Brand />
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                className="rounded px-1 text-sm text-slate-600 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:text-white dark:focus-visible:ring-offset-slate-950"
                to="/"
              >
                Back
              </Link>
            </div>
          </div>

          <p className="font-mono text-xs tracking-[0.16em] text-blue-700 uppercase dark:text-blue-400">
            Account access
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-4xl dark:text-slate-50">
            {title}
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-400">{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}

export default AuthPageLayout;

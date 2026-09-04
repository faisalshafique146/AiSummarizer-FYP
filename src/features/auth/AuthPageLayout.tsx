import type { ReactNode } from "react";
import { Link } from "react-router";
import Brand from "../../components/Brand";

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
      className="grid min-h-screen bg-[#f8f8f6] lg:grid-cols-[320px_minmax(0,1fr)]"
      id="main-content"
    >
      <aside className="hidden border-r border-slate-300 p-8 lg:flex lg:flex-col xl:p-10">
        <Link
          aria-label="HiSumz home"
          className="w-fit rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
          to="/"
        >
          <Brand />
        </Link>

        <div className="my-auto py-16">
          <p className="font-mono text-xs tracking-[0.16em] text-blue-700 uppercase">
            One focused workflow
          </p>
          <p className="mt-5 text-2xl leading-9 font-semibold tracking-[-0.035em] text-slate-950">
            Paste source text.
            <br />
            Generate a summary.
            <br />
            Review and copy.
          </p>
          <div className="mt-10 flex items-center gap-2" aria-hidden="true">
            <span className="h-px w-12 bg-blue-600" />
            <span className="size-1.5 bg-blue-600" />
            <span className="h-px flex-1 bg-slate-300" />
          </div>
        </div>

        <Link className="text-sm text-slate-500 hover:text-slate-950" to="/">
          &larr; Return to HiSumz
        </Link>
      </aside>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-[430px]">
          <div className="mb-12 flex items-center justify-between lg:hidden">
            <Link
              aria-label="HiSumz home"
              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              to="/"
            >
              <Brand />
            </Link>
            <Link className="text-sm text-slate-500 hover:text-slate-950" to="/">
              Back
            </Link>
          </div>

          <p className="font-mono text-xs tracking-[0.16em] text-blue-700 uppercase">
            Account access
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-slate-950">
            {title}
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}

export default AuthPageLayout;

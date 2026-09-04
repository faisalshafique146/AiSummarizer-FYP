import { Link } from "react-router";
import { buttonStyles } from "./ui/buttonStyles";

const workflowSteps = [
  { number: "01", title: "Paste", detail: "Add the text you want to shorten." },
  { number: "02", title: "Generate", detail: "Create one focused summary." },
  { number: "03", title: "Review", detail: "Read the result alongside the source." },
  { number: "04", title: "Copy", detail: "Take the summary where you need it." },
] as const;

function SignedOutLanding() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <section className="border-b border-slate-300 py-12 sm:py-24 lg:py-28 dark:border-slate-800">
        <p className="font-mono text-xs tracking-[0.16em] text-blue-700 uppercase dark:text-blue-400">
          Text summarizer / HiSumz
        </p>
        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-end lg:gap-16">
          <h1 className="max-w-4xl text-4xl leading-[1.02] font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl sm:leading-[0.98] lg:text-7xl dark:text-slate-50">
            Keep the point. Cut the length.
          </h1>
          <div className="max-w-lg lg:pb-1">
            <p className="text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 dark:text-slate-400">
              HiSumz turns articles, reports, and notes into a concise summary.
              It does one job, with no chat window or unnecessary controls.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                className={buttonStyles({ size: "lg", variant: "primary" })}
                to="/sign-up"
              >
                Start summarizing
                <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                className={buttonStyles({ size: "lg", variant: "secondary" })}
                to="/sign-in"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="workflow-heading" className="py-14 sm:py-18">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-16">
          <div>
            <p className="font-mono text-xs tracking-[0.16em] text-slate-500 uppercase dark:text-slate-500">
              The workflow
            </p>
            <h2
              className="mt-4 text-2xl font-semibold tracking-[-0.025em] text-slate-950 dark:text-slate-50"
              id="workflow-heading"
            >
              From source to summary, without detours.
            </h2>
          </div>

          <ol className="grid border-t border-slate-300 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
            {workflowSteps.map((step, index) => (
              <li
                className={`border-b border-slate-300 py-6 sm:px-5 lg:border-b-0 dark:border-slate-800 ${
                  index % 2 === 1 ? "sm:border-l" : ""
                } ${index > 0 ? "lg:border-l" : ""}`}
                key={step.number}
              >
                <span className="font-mono text-xs text-blue-700 dark:text-blue-400">{step.number}</span>
                <h3 className="mt-5 font-semibold text-slate-950 dark:text-slate-100">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

export default SignedOutLanding;

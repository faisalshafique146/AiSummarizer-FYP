import {
  useEffect,
  useRef,
  useState,
  type ChangeEventHandler,
  type KeyboardEventHandler,
  type SubmitEventHandler,
} from "react";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Panel from "../../components/ui/Panel";
import Textarea from "../../components/ui/Textarea";
import Toast from "../../components/ui/Toast";
import { summarizeText } from "./summarizationService";
import {
  MAX_SUMMARIZE_TEXT_LENGTH,
  SummarizationError,
  type SummarizeError,
} from "./types";

interface ToastState {
  message: string;
  tone: "error" | "success";
}

function countWords(value: string): number {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue.split(/\s+/u).length : 0;
}

function CopyIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 20 20">
      <path
        d="M6.75 6.75V4.5A1.75 1.75 0 0 1 8.5 2.75h7A1.75 1.75 0 0 1 17.25 4.5v7A1.75 1.75 0 0 1 15.5 13.25h-2.25m-9.75-6.5h7A1.75 1.75 0 0 1 12.25 8.5v7a1.75 1.75 0 0 1-1.75 1.75h-7A1.75 1.75 0 0 1 1.75 15.5v-7A1.75 1.75 0 0 1 3.5 6.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SummarySkeleton() {
  return (
    <div aria-label="Generating summary" className="space-y-3" role="status">
      <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-[92%] animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-[97%] animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-[78%] animate-pulse rounded bg-slate-200" />
      <div className="pt-3">
        <div className="h-4 w-[88%] animate-pulse rounded bg-slate-200" />
      </div>
      <span className="sr-only">Generating your summary</span>
    </div>
  );
}

function SummarizerWorkspace() {
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [summaryError, setSummaryError] = useState<SummarizeError | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const inputWords = countWords(inputValue);
  const outputWords = countWords(outputValue);
  const remainingCharacters = MAX_SUMMARIZE_TEXT_LENGTH - inputValue.length;
  const isNearLimit = remainingCharacters <= 1_000;
  const canSubmit = inputValue.trim().length > 0 && !isFetching;

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3_000);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  const handleInputChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setInputValue(event.target.value);
    setSummaryError(null);
  };

  const generateSummary = async (): Promise<void> => {
    try {
      setIsFetching(true);
      setSummaryError(null);
      setOutputValue("");
      setOutputValue(await summarizeText(inputValue));
    } catch (error: unknown) {
      setSummaryError(
        error instanceof SummarizationError
          ? error.details
          : {
              code: "UPSTREAM_FAILURE",
              message: "Something went wrong while generating the summary.",
              retryable: true,
            },
      );
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (canSubmit) {
      void generateSummary();
    }
  };

  const handleShortcut: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && canSubmit) {
      event.preventDefault();
      void generateSummary();
    }
  };

  const resetWorkspace = (): void => {
    setInputValue("");
    setOutputValue("");
    setSummaryError(null);
    inputRef.current?.focus();
  };

  const copyOutput = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(outputValue);
      setToast({ message: "Summary copied to your clipboard.", tone: "success" });
    } catch {
      setToast({
        message: "Could not copy the summary. Select the text and copy it manually.",
        tone: "error",
      });
    }
  };

  return (
    <>
      <Panel className="overflow-hidden border-slate-300">
        <form className="grid lg:grid-cols-2" onSubmit={handleSubmit}>
          <section className="flex min-h-[500px] flex-col p-5 sm:p-7 lg:border-r lg:border-slate-300">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs tracking-[0.14em] text-blue-700 uppercase">
                  01 / Source
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Paste an article, report, or passage to condense.
                </p>
              </div>
              {inputValue ? (
                <Button
                  className="-mr-2"
                  disabled={isFetching}
                  onClick={resetWorkspace}
                  size="sm"
                  variant="ghost"
                >
                  Clear
                </Button>
              ) : null}
            </div>

            <label className="sr-only" htmlFor="source-text">
              Text to summarize
            </label>
            <Textarea
              aria-describedby="source-text-meta"
              className="mt-5 min-h-72 flex-1 resize-none border-slate-200 bg-[#f6f7f8] p-5 focus:bg-white focus:ring-2 lg:min-h-80"
              disabled={isFetching}
              id="source-text"
              maxLength={MAX_SUMMARIZE_TEXT_LENGTH}
              onChange={handleInputChange}
              onKeyDown={handleShortcut}
              placeholder="Paste the full text you want to summarize here..."
              ref={inputRef}
              value={inputValue}
            />

            <div
              className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"
              id="source-text-meta"
            >
              <span>
                {inputWords.toLocaleString()} {inputWords === 1 ? "word" : "words"}
              </span>
              {isNearLimit ? (
                <span className="font-medium text-amber-700">
                  {remainingCharacters.toLocaleString()} characters remaining
                </span>
              ) : (
                <span>
                  {inputValue.length.toLocaleString()} /{" "}
                  {MAX_SUMMARIZE_TEXT_LENGTH.toLocaleString()} characters
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">
                Tip: press Ctrl/Command + Enter to generate
              </p>
              <Button
                className="w-full sm:w-auto"
                disabled={!canSubmit}
                isLoading={isFetching}
                loadingLabel="Generating summary..."
                size="lg"
                type="submit"
              >
                Generate summary
              </Button>
            </div>
          </section>

          <section className="flex min-h-[500px] flex-col border-t border-slate-300 bg-[#f3f4f4] p-5 sm:p-7 lg:border-t-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs tracking-[0.14em] text-blue-700 uppercase">
                  02 / Summary
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Review the result before copying or starting again.
                </p>
              </div>
              {outputValue ? (
                <Button onClick={() => void copyOutput()} size="sm" variant="secondary">
                  <CopyIcon />
                  Copy
                </Button>
              ) : null}
            </div>

            <div className="mt-5 flex flex-1 flex-col rounded-md border border-slate-300 bg-white p-5 sm:p-6">
              {isFetching ? <SummarySkeleton /> : null}

              {!isFetching && summaryError ? (
                <div className="my-auto">
                  <Alert title="We could not generate a summary">
                    <p>{summaryError.message}</p>
                    {summaryError.retryable ? (
                      <Button
                        className="mt-4"
                        onClick={() => void generateSummary()}
                        size="sm"
                        variant="secondary"
                      >
                        Try again
                      </Button>
                    ) : null}
                  </Alert>
                </div>
              ) : null}

              {!isFetching && !summaryError && outputValue ? (
                <article className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                  {outputValue}
                </article>
              ) : null}

              {!isFetching && !summaryError && !outputValue ? (
                <div className="my-auto max-w-sm py-12">
                  <span className="block h-0.5 w-10 bg-blue-600" aria-hidden="true" />
                  <p className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
                    Nothing generated yet.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Add source text, then choose Generate summary. The result will
                    stay here while you compare it with the original.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex min-h-10 flex-wrap items-center justify-between gap-3">
              {outputValue ? (
                <span className="text-xs text-slate-500">
                  {outputWords.toLocaleString()} {outputWords === 1 ? "word" : "words"}{" "}
                  in summary
                </span>
              ) : (
                <span aria-hidden="true" />
              )}
              {outputValue ? (
                <Button onClick={resetWorkspace} size="sm" variant="ghost">
                  Start another summary
                </Button>
              ) : null}
            </div>
          </section>
        </form>
      </Panel>

      {toast ? (
        <Toast
          message={toast.message}
          onDismiss={() => {
            setToast(null);
          }}
          tone={toast.tone}
        />
      ) : null}
    </>
  );
}

export default SummarizerWorkspace;

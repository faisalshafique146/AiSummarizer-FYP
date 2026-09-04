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
import {
  MAX_SUMMARIZE_TEXT_LENGTH,
  MIN_SUMMARIZE_WORD_COUNT,
} from "./types";
import { useSummarizer } from "./useSummarizer";
import { countWords } from "./validation";

interface ToastState {
  message: string;
  tone: "error" | "success";
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
    <div className="space-y-3" role="status">
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
  const {
    cancel,
    clear,
    input,
    isSubmitting,
    requestState,
    setInput,
    submit,
    summary,
  } = useSummarizer();
  const [toast, setToast] = useState<ToastState | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const inputWords = countWords(input);
  const outputWords = countWords(summary);
  const remainingCharacters = MAX_SUMMARIZE_TEXT_LENGTH - input.length;
  const isNearLimit = remainingCharacters <= 1_000;
  const needsMoreWords = inputWords > 0 && inputWords < MIN_SUMMARIZE_WORD_COUNT;
  const validationError =
    requestState.status === "validation-error" ? requestState.error : null;
  const apiError = requestState.status === "api-error" ? requestState.error : null;

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 5_000);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  const handleInputChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setInput(event.target.value);
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void submit();
  };

  const handleShortcut: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      void submit();
    }
  };

  const resetWorkspace = (): void => {
    clear();
    inputRef.current?.focus();
  };

  const cancelRequest = (): void => {
    cancel();
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const copyOutput = async (): Promise<void> => {
    try {
      if (!summary) {
        return;
      }

      await navigator.clipboard.writeText(summary);
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
          <section
            aria-labelledby="source-heading"
            className="flex min-w-0 flex-col p-5 sm:p-7 lg:border-r lg:border-slate-300"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2
                  className="font-mono text-xs tracking-[0.14em] text-blue-700 uppercase"
                  id="source-heading"
                >
                  01 / Source
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Paste an article, report, or passage to condense.
                </p>
              </div>
              {input ? (
                <Button
                  className="-mr-2"
                  disabled={isSubmitting}
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
              aria-describedby={
                validationError
                  ? "source-text-meta source-text-error"
                  : "source-text-meta"
              }
              aria-invalid={Boolean(validationError)}
              className="mt-5 min-h-64 resize-y border-slate-200 bg-[#f6f7f8] p-4 focus-visible:bg-white focus-visible:ring-2 sm:min-h-72 sm:p-5 lg:min-h-80 lg:flex-1 lg:resize-none"
              disabled={isSubmitting}
              id="source-text"
              maxLength={MAX_SUMMARIZE_TEXT_LENGTH}
              onChange={handleInputChange}
              onKeyDown={handleShortcut}
              placeholder="Paste the full text you want to summarize here..."
              ref={inputRef}
              value={input}
            />

            {validationError ? (
              <p className="mt-3 text-sm font-medium text-red-700" id="source-text-error" role="alert">
                {validationError.message}
              </p>
            ) : null}

            <div
              className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"
              id="source-text-meta"
            >
              <span>
                {inputWords.toLocaleString()} {inputWords === 1 ? "word" : "words"}
                {needsMoreWords
                  ? ` / ${MIN_SUMMARIZE_WORD_COUNT.toLocaleString()} minimum`
                  : ""}
              </span>
              {isNearLimit ? (
                <span className="font-medium text-amber-700">
                  {remainingCharacters.toLocaleString()} characters remaining
                </span>
              ) : (
                <span>
                  {input.length.toLocaleString()} /{" "}
                  {MAX_SUMMARIZE_TEXT_LENGTH.toLocaleString()} characters
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-600">
                Tip: press Ctrl/Command + Enter to generate
              </p>
              <div className="flex w-full gap-2 sm:w-auto">
                {isSubmitting ? (
                  <Button
                    className="shrink-0"
                    onClick={cancelRequest}
                    size="lg"
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                ) : null}
                <Button
                  className="min-w-0 flex-1 sm:flex-none"
                  isLoading={isSubmitting}
                  loadingLabel="Generating summary..."
                  size="lg"
                  type="submit"
                >
                  Generate summary
                </Button>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="summary-heading"
            className="flex min-w-0 flex-col border-t border-slate-300 bg-[#f3f4f4] p-5 sm:p-7 lg:border-t-0"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2
                  className="font-mono text-xs tracking-[0.14em] text-blue-700 uppercase"
                  id="summary-heading"
                >
                  02 / Summary
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Review the result before copying or starting again.
                </p>
              </div>
              <Button
                disabled={!summary || isSubmitting}
                onClick={() => void copyOutput()}
                size="sm"
                variant="secondary"
              >
                <CopyIcon />
                Copy
              </Button>
            </div>

            <div className="mt-5 flex min-h-64 min-w-0 flex-1 flex-col rounded-md border border-slate-300 bg-white p-5 sm:min-h-72 sm:p-6 lg:min-h-80">
              {isSubmitting ? <SummarySkeleton /> : null}

              {!isSubmitting && apiError ? (
                <div className="my-auto">
                  <Alert title="We could not generate a summary">
                    <p>{apiError.message}</p>
                    {apiError.retryable ? (
                      <Button
                        className="mt-4"
                        onClick={() => void submit()}
                        size="sm"
                        variant="secondary"
                      >
                        Try again
                      </Button>
                    ) : null}
                  </Alert>
                </div>
              ) : null}

              {!isSubmitting && summary ? (
                <>
                  <p className="sr-only" role="status">
                    Summary generated. {outputWords.toLocaleString()} {outputWords === 1 ? "word" : "words"}.
                  </p>
                  <article className="break-words whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                    {summary}
                  </article>
                </>
              ) : null}

              {!isSubmitting && !apiError && !summary ? (
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
              {summary ? (
                <span className="text-xs text-slate-500">
                  {outputWords.toLocaleString()} {outputWords === 1 ? "word" : "words"}{" "}
                  in summary
                </span>
              ) : (
                <span aria-hidden="true" />
              )}
              {summary ? (
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

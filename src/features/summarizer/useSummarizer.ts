import { useCallback, useEffect, useRef, useState } from "react";
import { summarizeText } from "./summarizationService";
import {
  MAX_SUMMARIZE_TEXT_LENGTH,
  SummarizationError,
  type SummarizeError,
} from "./types";

export type SummarizerRequestState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; summary: string }
  | { status: "validation-error"; error: SummarizeError }
  | { status: "api-error"; error: SummarizeError };

const idleState: SummarizerRequestState = { status: "idle" };

function validationError(
  code: "EMPTY_TEXT" | "INPUT_TOO_LARGE",
  message: string,
): SummarizerRequestState {
  return {
    status: "validation-error",
    error: { code, message, retryable: false },
  };
}

function unexpectedApiError(): SummarizeError {
  return {
    code: "UPSTREAM_FAILURE",
    message: "Something went wrong while generating the summary. Try again.",
    retryable: true,
  };
}

export function useSummarizer() {
  const [input, setInputState] = useState("");
  const [requestState, setRequestState] =
    useState<SummarizerRequestState>(idleState);
  const activeRequestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      activeRequestRef.current?.abort();
    };
  }, []);

  const setInput = useCallback((value: string): void => {
    if (activeRequestRef.current) {
      return;
    }

    setInputState(value);
    setRequestState(idleState);
  }, []);

  const submit = useCallback(async (): Promise<void> => {
    if (activeRequestRef.current) {
      return;
    }

    const text = input.trim();

    if (!text) {
      setRequestState(validationError("EMPTY_TEXT", "Enter text to summarize."));
      return;
    }

    if (text.length > MAX_SUMMARIZE_TEXT_LENGTH) {
      setRequestState(
        validationError(
          "INPUT_TOO_LARGE",
          `Text must be ${MAX_SUMMARIZE_TEXT_LENGTH.toLocaleString()} characters or fewer.`,
        ),
      );
      return;
    }

    const controller = new AbortController();
    activeRequestRef.current = controller;
    setInputState(text);
    setRequestState({ status: "submitting" });

    try {
      const summary = await summarizeText(text, controller.signal);

      if (activeRequestRef.current === controller && !controller.signal.aborted) {
        setRequestState({ status: "success", summary });
      }
    } catch (error: unknown) {
      if (activeRequestRef.current !== controller || controller.signal.aborted) {
        return;
      }

      if (error instanceof SummarizationError) {
        const isValidationError =
          error.details.code === "EMPTY_TEXT" ||
          error.details.code === "INPUT_TOO_LARGE";

        setRequestState({
          status: isValidationError ? "validation-error" : "api-error",
          error: error.details,
        });
      } else {
        setRequestState({ status: "api-error", error: unexpectedApiError() });
      }
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
      }
    }
  }, [input]);

  const cancel = useCallback((): void => {
    const activeRequest = activeRequestRef.current;

    if (!activeRequest) {
      return;
    }

    activeRequestRef.current = null;
    activeRequest.abort();
    setRequestState(idleState);
  }, []);

  const clear = useCallback((): void => {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    setInputState("");
    setRequestState(idleState);
  }, []);

  return {
    cancel,
    clear,
    input,
    isSubmitting: requestState.status === "submitting",
    requestState,
    setInput,
    submit,
    summary: requestState.status === "success" ? requestState.summary : "",
  };
}

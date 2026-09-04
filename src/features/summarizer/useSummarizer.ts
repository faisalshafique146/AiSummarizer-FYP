import { useEffect, useRef, useState } from "react";
import { summarizeText } from "./summarizationService";
import {
  SummarizationError,
  type SummarizeError,
} from "./types";
import { validateSummarizeText } from "./validation";

export type SummarizerRequestState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; summary: string }
  | { status: "validation-error"; error: SummarizeError }
  | { status: "api-error"; error: SummarizeError };

const idleState: SummarizerRequestState = { status: "idle" };

function validationError(error: SummarizeError): SummarizerRequestState {
  return {
    status: "validation-error",
    error,
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

  const setInput = (value: string): void => {
    if (activeRequestRef.current) {
      return;
    }

    setInputState(value);
    setRequestState(idleState);
  };

  const submit = async (): Promise<void> => {
    if (activeRequestRef.current) {
      return;
    }

    const validation = validateSummarizeText(input);

    if (!validation.valid) {
      setRequestState(validationError(validation.error));
      return;
    }

    const { text } = validation;

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
          error.details.code === "INPUT_TOO_SHORT" ||
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
  };

  const cancel = (): void => {
    const activeRequest = activeRequestRef.current;

    if (!activeRequest) {
      return;
    }

    activeRequestRef.current = null;
    activeRequest.abort();
    setRequestState(idleState);
  };

  const clear = (): void => {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    setInputState("");
    setRequestState(idleState);
  };

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

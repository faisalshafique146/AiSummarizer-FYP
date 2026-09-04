import {
  MAX_SUMMARIZE_TEXT_LENGTH,
  SummarizationError,
  type SummarizeError,
  type SummarizeErrorCode,
  type SummarizeRequest,
  type SummarizeResponse,
} from "./types";

const summarizeEndpoint = "/api/summarize";

const errorCodes: ReadonlySet<string> = new Set<SummarizeErrorCode>([
  "EMPTY_TEXT",
  "INPUT_TOO_LARGE",
  "INVALID_REQUEST",
  "INVALID_RESPONSE",
  "METHOD_NOT_ALLOWED",
  "MODEL_UNAVAILABLE",
  "NETWORK_FAILURE",
  "RATE_LIMITED",
  "SERVER_CONFIGURATION",
  "UPSTREAM_FAILURE",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSummarizeErrorCode(value: unknown): value is SummarizeErrorCode {
  return typeof value === "string" && errorCodes.has(value);
}

function isSummarizeError(value: unknown): value is SummarizeError {
  return (
    isRecord(value) &&
    isSummarizeErrorCode(value.code) &&
    typeof value.message === "string" &&
    typeof value.retryable === "boolean"
  );
}

function isSummarizeResponse(value: unknown): value is SummarizeResponse {
  if (!isRecord(value) || typeof value.ok !== "boolean") {
    return false;
  }

  if (value.ok) {
    return typeof value.summary === "string";
  }

  return isSummarizeError(value.error);
}

function createClientError(
  code: SummarizeErrorCode,
  message: string,
  retryable = false,
  options?: ErrorOptions,
): SummarizationError {
  return new SummarizationError({ code, message, retryable }, options);
}

async function readResponse(response: Response): Promise<SummarizeResponse> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch (error: unknown) {
    throw createClientError(
      "INVALID_RESPONSE",
      "The summarization service returned an invalid response.",
      true,
      { cause: error },
    );
  }

  if (!isSummarizeResponse(payload)) {
    throw createClientError(
      "INVALID_RESPONSE",
      "The summarization service returned an unexpected response.",
      true,
    );
  }

  return payload;
}

export async function summarizeText(
  input: string,
  signal: AbortSignal,
): Promise<string> {
  const text = input.trim();

  if (!text) {
    throw createClientError("EMPTY_TEXT", "Enter text to summarize.");
  }

  if (text.length > MAX_SUMMARIZE_TEXT_LENGTH) {
    throw createClientError(
      "INPUT_TOO_LARGE",
      `Text must be ${MAX_SUMMARIZE_TEXT_LENGTH.toLocaleString()} characters or fewer.`,
    );
  }

  const request: SummarizeRequest = { text };
  let response: Response;

  try {
    response = await fetch(summarizeEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal,
    });
  } catch (error: unknown) {
    if (signal.aborted) {
      throw error;
    }

    throw createClientError(
      "NETWORK_FAILURE",
      "Unable to reach the summarization service. Try again.",
      true,
      { cause: error },
    );
  }

  const payload = await readResponse(response);

  if (!payload.ok) {
    throw new SummarizationError(payload.error);
  }

  if (!response.ok) {
    throw createClientError(
      "INVALID_RESPONSE",
      "The summarization service returned an inconsistent response.",
      true,
    );
  }

  return payload.summary;
}

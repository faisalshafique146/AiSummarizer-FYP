import {
  SummarizationError,
  type SummarizationApiErrorResponse,
  type SummarizationApiResponse,
  type SummarizationResult,
  type SummarizationResultResponse,
} from "./types";

const modelEndpoint =
  "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSummarizationResult(value: unknown): value is SummarizationResult {
  return isRecord(value) && typeof value.summary_text === "string";
}

function isResultResponse(value: unknown): value is SummarizationResultResponse {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(isSummarizationResult)
  );
}

function isErrorResponse(
  value: unknown,
): value is SummarizationApiErrorResponse {
  return isRecord(value) && typeof value.error === "string";
}

function isSummarizationApiResponse(
  value: unknown,
): value is SummarizationApiResponse {
  return isResultResponse(value) || isErrorResponse(value);
}

async function readResponse(response: Response): Promise<unknown> {
  try {
    const payload: unknown = await response.json();
    return payload;
  } catch (error: unknown) {
    throw new SummarizationError(
      "invalid-response",
      "The summarization service returned invalid JSON.",
      { cause: error },
    );
  }
}

export async function summarizeText(input: string): Promise<string> {
  const huggingFaceToken = import.meta.env.VITE_HUGGING_FACE_API_TOKEN;

  if (!huggingFaceToken) {
    throw new SummarizationError(
      "missing-token",
      "Missing VITE_HUGGING_FACE_API_TOKEN. Add it to your .env.local file.",
    );
  }

  let response: Response;

  try {
    response = await fetch(modelEndpoint, {
      headers: {
        Authorization: `Bearer ${huggingFaceToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: input }),
    });
  } catch (error: unknown) {
    throw new SummarizationError(
      "network-error",
      "Unable to reach the summarization service.",
      { cause: error },
    );
  }

  const payload = await readResponse(response);

  if (!isSummarizationApiResponse(payload)) {
    throw new SummarizationError(
      "invalid-response",
      "The summarization service returned an unexpected response.",
    );
  }

  if (isErrorResponse(payload)) {
    throw new SummarizationError("provider-error", payload.error);
  }

  if (!response.ok) {
    throw new SummarizationError(
      "provider-error",
      `The summarization service returned HTTP ${String(response.status)}.`,
    );
  }

  return payload[0].summary_text;
}

import type { IncomingHttpHeaders } from "node:http";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  type SummarizeError,
  type SummarizeRequest,
  type SummarizeResponse,
} from "../src/features/summarizer/types.ts";
import {
  countWords,
  validateSummarizeText,
} from "../src/features/summarizer/validation.ts";

const modelEndpoint =
  "https://router.huggingface.co/hf-inference/models/sshleifer/distilbart-cnn-12-6";
const upstreamTimeoutMilliseconds = 30_000;
const minimumSummaryTokens = 5;
const maximumSummaryTokens = 160;

const invocationFailure: SummarizeError = {
  code: "UPSTREAM_FAILURE",
  message: "The summarization service could not process the request.",
  retryable: true,
};

function getMaximumSummaryTokens(text: string): number {
  const proportionalLimit = Math.floor(countWords(text) * 0.45);
  return Math.min(maximumSummaryTokens, Math.max(12, proportionalLimit));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getSummary(payload: unknown): string | null {
  const result: unknown = Array.isArray(payload) ? payload[0] : payload;

  if (!isRecord(result) || typeof result.summary_text !== "string") {
    return null;
  }

  return result.summary_text.trim() || null;
}

function errorResponse(
  status: number,
  error: SummarizeError,
  headers?: HeadersInit,
): Response {
  const response: SummarizeResponse = { ok: false, error };
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Cache-Control", "no-store");

  return Response.json(response, { status, headers: responseHeaders });
}

function successResponse(summary: string): Response {
  const response: SummarizeResponse = { ok: true, summary };

  return Response.json(response, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}

function toWebHeaders(nodeHeaders: IncomingHttpHeaders): Headers {
  const headers = new Headers();

  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (typeof value === "string") {
      headers.append(name, value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    }
  }

  headers.delete("content-length");
  return headers;
}

function getWebRequestBody(request: VercelRequest): string | undefined {
  const body: unknown = request.body;

  if (body === undefined || body === null) {
    return undefined;
  }

  if (typeof body === "string") {
    return body;
  }

  if (body instanceof Uint8Array) {
    return Buffer.from(body).toString("utf8");
  }

  return JSON.stringify(body);
}

function toWebRequest(request: VercelRequest): Request {
  const method = request.method ?? "GET";
  const host = request.headers.host ?? "localhost";
  const url = new URL(request.url ?? "/api/summarize", `https://${host}`);
  const init: RequestInit = {
    headers: toWebHeaders(request.headers),
    method,
  };

  if (method !== "GET" && method !== "HEAD") {
    const body = getWebRequestBody(request);

    if (body !== undefined) {
      init.body = body;
    }
  }

  return new Request(url, init);
}

async function writeNodeResponse(
  webResponse: Response,
  response: VercelResponse,
): Promise<void> {
  response.statusCode = webResponse.status;
  webResponse.headers.forEach((value, name) => {
    response.setHeader(name, value);
  });
  response.end(Buffer.from(await webResponse.arrayBuffer()));
}

function writeInvocationFailure(response: VercelResponse): void {
  response.statusCode = 500;
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify({ ok: false, error: invocationFailure }));
}

function validateRequestBody(
  body: unknown,
):
  | { valid: true; request: SummarizeRequest }
  | { valid: false; status: number; error: SummarizeError } {
  if (!isRecord(body) || typeof body.text !== "string") {
    return {
      valid: false,
      status: 400,
      error: {
        code: "INVALID_REQUEST",
        message: "The request body must contain a text string.",
        retryable: false,
      },
    };
  }

  const validation = validateSummarizeText(body.text);

  if (!validation.valid) {
    return {
      valid: false,
      status: validation.error.code === "INPUT_TOO_LARGE" ? 413 : 400,
      error: validation.error,
    };
  }

  return { valid: true, request: { text: validation.text } };
}

function mapUpstreamFailure(response: Response): Response {
  if (response.status === 401 || response.status === 403) {
    return errorResponse(503, {
      code: "SERVER_CONFIGURATION",
      message: "The summarization service is not configured correctly.",
      retryable: false,
    });
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    const headers = retryAfter ? { "Retry-After": retryAfter } : undefined;

    return errorResponse(
      429,
      {
        code: "RATE_LIMITED",
        message: "The summarization service is busy. Try again shortly.",
        retryable: true,
      },
      headers,
    );
  }

  if (
    response.status === 404 ||
    response.status === 410 ||
    response.status === 503
  ) {
    const retryable = response.status === 503;

    return errorResponse(retryable ? 503 : 502, {
      code: "MODEL_UNAVAILABLE",
      message: retryable
        ? "The summarization model is loading or temporarily unavailable."
        : "The configured summarization model is unavailable.",
      retryable,
    });
  }

  return errorResponse(502, {
    code: "UPSTREAM_FAILURE",
    message: "The summarization provider could not complete the request.",
    retryable: response.status >= 500,
  });
}

export async function handleSummarizeRequest(
  request: Request,
  tokenValue: string | undefined,
): Promise<Response> {
  if (request.method !== "POST") {
    return errorResponse(
      405,
      {
        code: "METHOD_NOT_ALLOWED",
        message: "Use POST for this endpoint.",
        retryable: false,
      },
      { Allow: "POST" },
    );
  }

  const contentType = request.headers.get("Content-Type");
  const mediaType = contentType?.split(";").at(0)?.trim().toLowerCase();

  if (mediaType !== "application/json") {
    return errorResponse(415, {
      code: "INVALID_REQUEST",
      message: "The request body must be JSON.",
      retryable: false,
    });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(400, {
      code: "INVALID_REQUEST",
      message: "The request body contains invalid JSON.",
      retryable: false,
    });
  }

  const validation = validateRequestBody(body);

  if (!validation.valid) {
    return errorResponse(validation.status, validation.error);
  }

  const token = tokenValue?.trim();

  if (!token) {
    return errorResponse(503, {
      code: "SERVER_CONFIGURATION",
      message: "The summarization service is not configured correctly.",
      retryable: false,
    });
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(modelEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: validation.request.text,
        parameters: {
          clean_up_tokenization_spaces: true,
          do_sample: false,
          max_new_tokens: getMaximumSummaryTokens(validation.request.text),
          min_new_tokens: minimumSummaryTokens,
          truncation: "longest_first",
        },
      }),
      signal: AbortSignal.timeout(upstreamTimeoutMilliseconds),
    });
  } catch {
    return errorResponse(502, {
      code: "UPSTREAM_FAILURE",
      message: "The summarization provider could not be reached.",
      retryable: true,
    });
  }

  if (!upstreamResponse.ok) {
    return mapUpstreamFailure(upstreamResponse);
  }

  let upstreamPayload: unknown;

  try {
    upstreamPayload = await upstreamResponse.json();
  } catch {
    return errorResponse(502, {
      code: "UPSTREAM_FAILURE",
      message: "The summarization provider returned an invalid response.",
      retryable: true,
    });
  }

  const summary = getSummary(upstreamPayload);

  if (!summary) {
    return errorResponse(502, {
      code: "UPSTREAM_FAILURE",
      message: "The summarization provider returned an unexpected response.",
      retryable: true,
    });
  }

  if (countWords(summary) >= countWords(validation.request.text)) {
    return errorResponse(422, {
      code: "UNUSABLE_SUMMARY",
      message:
        "The source is already too concise or repetitive to summarize reliably. Try a longer, more detailed passage.",
      retryable: false,
    });
  }

  return successResponse(summary);
}

export default async function summarize(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  try {
    const webRequest = toWebRequest(request);
    const webResponse = await handleSummarizeRequest(
      webRequest,
      process.env.HUGGING_FACE_API_TOKEN,
    );
    await writeNodeResponse(webResponse, response);
  } catch (error: unknown) {
    console.error("Unhandled summarization function error", error);
    writeInvocationFailure(response);
  }
}

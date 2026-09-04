// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  MAX_SUMMARIZE_TEXT_LENGTH,
  MIN_SUMMARIZE_WORD_COUNT,
} from "../src/features/summarizer/types.ts";
import vercelHandler, { handleSummarizeRequest } from "../api/summarize.ts";

const validSource = Array.from(
  { length: MIN_SUMMARIZE_WORD_COUNT },
  (_, index) => `word${String(index + 1)}`,
).join(" ");

function postRequest(body: unknown): Request {
  return new Request("http://localhost/api/summarize", {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("summarize API handler", () => {
  it("serves JSON through the Node handler expected by Vercel's Vite runtime", async () => {
    expect(vercelHandler).toBeTypeOf("function");

    const request = {
      headers: { host: "localhost" },
      method: "GET",
      url: "/api/summarize",
    } as VercelRequest;
    const responseHeaders = new Headers();
    let responseBody = Buffer.alloc(0);
    const response = {
      setHeader(name: string, value: number | string | readonly string[]) {
        responseHeaders.set(name, String(value));
        return this;
      },
      end(chunk?: Uint8Array) {
        responseBody = chunk ? Buffer.from(chunk) : Buffer.alloc(0);
        return this;
      },
      statusCode: 200,
    } as unknown as VercelResponse;

    await vercelHandler(request, response);

    expect(response.statusCode).toBe(405);
    expect(responseHeaders.get("content-type")).toContain("application/json");
    expect(JSON.parse(responseBody.toString("utf8"))).toMatchObject({
      ok: false,
      error: { code: "METHOD_NOT_ALLOWED" },
    });
  });

  it("rejects whitespace-only input before calling the provider", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleSummarizeRequest(postRequest({ text: "   " }), "token");
    const payload: unknown = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      ok: false,
      error: {
        code: "EMPTY_TEXT",
        message: "Enter text to summarize.",
        retryable: false,
      },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects input beyond the shared client/server limit", async () => {
    const response = await handleSummarizeRequest(
      postRequest({ text: "a".repeat(MAX_SUMMARIZE_TEXT_LENGTH + 1) }),
      "token",
    );
    const payload: unknown = await response.json();

    expect(response.status).toBe(413);
    expect(payload).toMatchObject({
      ok: false,
      error: { code: "INPUT_TOO_LARGE", retryable: false },
    });
  });

  it("rejects a title or fragment before calling the provider", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleSummarizeRequest(
      postRequest({ text: "994. Rotting Oranges" }),
      "token",
    );
    const payload: unknown = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toMatchObject({
      ok: false,
      error: { code: "INPUT_TOO_SHORT", retryable: false },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps provider rate limits to a safe typed error", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("provider details", {
        headers: { "Retry-After": "30" },
        status: 429,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleSummarizeRequest(
      postRequest({ text: validSource }),
      "token",
    );
    const payload: unknown = await response.json();

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("30");
    expect(payload).toEqual({
      ok: false,
      error: {
        code: "RATE_LIMITED",
        message: "The summarization service is busy. Try again shortly.",
        retryable: true,
      },
    });
  });

  it("returns a normalized summary from a valid provider response", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json([{ summary_text: "  A concise result.  " }]),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleSummarizeRequest(
      postRequest({ text: validSource }),
      "token",
    );
    const payload: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, summary: "A concise result." });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          inputs: validSource,
          parameters: {
            clean_up_tokenization_spaces: true,
            do_sample: false,
            max_new_tokens: 13,
            min_new_tokens: 5,
            truncation: "longest_first",
          },
        }),
      }),
    );
  });

  it("rejects a model result that is not shorter than its source", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json([{ summary_text: validSource }]),
      ),
    );

    const response = await handleSummarizeRequest(
      postRequest({ text: validSource }),
      "token",
    );
    const payload: unknown = await response.json();

    expect(response.status).toBe(422);
    expect(payload).toEqual({
      ok: false,
      error: {
        code: "UNUSABLE_SUMMARY",
        message:
          "The source is already too concise or repetitive to summarize reliably. Try a longer, more detailed passage.",
        retryable: false,
      },
    });
  });
});

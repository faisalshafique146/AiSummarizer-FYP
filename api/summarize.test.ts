// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import { MAX_SUMMARIZE_TEXT_LENGTH } from "../src/features/summarizer/types.ts";
import { handleSummarizeRequest } from "./summarize.ts";

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

  it("maps provider rate limits to a safe typed error", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("provider details", {
        headers: { "Retry-After": "30" },
        status: 429,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleSummarizeRequest(
      postRequest({ text: "A valid source passage." }),
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
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json([{ summary_text: "  A concise result.  " }]),
      ),
    );

    const response = await handleSummarizeRequest(
      postRequest({ text: "A valid source passage." }),
      "token",
    );
    const payload: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, summary: "A concise result." });
  });
});

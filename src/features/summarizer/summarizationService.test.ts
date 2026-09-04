import { afterEach, describe, expect, it, vi } from "vitest";
import { summarizeText } from "./summarizationService";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("summarization client service", () => {
  it("parses a successful internal API response", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ ok: true, summary: "A useful summary." }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();

    await expect(
      summarizeText("  Source text  ", controller.signal),
    ).resolves.toBe("A useful summary.");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/summarize",
      expect.objectContaining({
        body: JSON.stringify({ text: "Source text" }),
        method: "POST",
        signal: controller.signal,
      }),
    );
  });

  it("preserves typed safe errors returned by the API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json(
          {
            ok: false,
            error: {
              code: "MODEL_UNAVAILABLE",
              message: "The summarization model is temporarily unavailable.",
              retryable: true,
            },
          },
          { status: 503 },
        ),
      ),
    );

    await expect(
      summarizeText("Source text", new AbortController().signal),
    ).rejects.toMatchObject({
      details: {
        code: "MODEL_UNAVAILABLE",
        message: "The summarization model is temporarily unavailable.",
        retryable: true,
      },
    });
  });

  it("maps non-JSON responses without exposing their contents", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response("<html>proxy failure</html>", {
          headers: { "Content-Type": "text/html" },
          status: 502,
        }),
      ),
    );

    await expect(
      summarizeText("Source text", new AbortController().signal),
    ).rejects.toMatchObject({
      details: {
        code: "INVALID_RESPONSE",
        message: "The summarization service returned an invalid response.",
        retryable: true,
      },
    });
  });
});

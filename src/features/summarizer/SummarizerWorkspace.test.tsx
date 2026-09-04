import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { summarizeText } from "./summarizationService";
import SummarizerWorkspace from "./SummarizerWorkspace";
import { MAX_SUMMARIZE_TEXT_LENGTH, SummarizationError } from "./types";

vi.mock("./summarizationService", () => ({
  summarizeText: vi.fn(),
}));

const summarizeTextMock = vi.mocked(summarizeText);

function deferred<T>() {
  let resolvePromise: ((value: T) => void) | undefined;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });

  return {
    promise,
    resolve(value: T) {
      if (!resolvePromise) {
        throw new Error("Deferred promise was not initialized.");
      }
      resolvePromise(value);
    },
  };
}

beforeEach(() => {
  summarizeTextMock.mockReset();
});

describe("SummarizerWorkspace", () => {
  it("blocks empty and over-limit input without making a request", async () => {
    const user = userEvent.setup();
    render(<SummarizerWorkspace />);

    const input = screen.getByRole("textbox", { name: "Text to summarize" });
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: "Generate summary" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Enter text to summarize.");
    expect(summarizeTextMock).not.toHaveBeenCalled();

    fireEvent.change(input, {
      target: { value: "a".repeat(MAX_SUMMARIZE_TEXT_LENGTH + 1) },
    });
    await user.click(screen.getByRole("button", { name: "Generate summary" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      `Text must be ${MAX_SUMMARIZE_TEXT_LENGTH.toLocaleString()} characters or fewer.`,
    );
    expect(summarizeTextMock).not.toHaveBeenCalled();
  });

  it("shows progress, trims input, renders success, and copies the result", async () => {
    const pendingSummary = deferred<string>();
    summarizeTextMock.mockReturnValue(pendingSummary.promise);
    const user = userEvent.setup();
    render(<SummarizerWorkspace />);

    const input = screen.getByRole("textbox", { name: "Text to summarize" });
    const copyButton = screen.getByRole("button", { name: "Copy" });
    expect(copyButton).toBeDisabled();

    await user.type(input, "  Long source text.  ");
    await user.click(screen.getByRole("button", { name: "Generate summary" }));

    expect(screen.getByRole("button", { name: "Generating summary..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(input).toHaveValue("Long source text.");
    expect(summarizeTextMock).toHaveBeenCalledWith(
      "Long source text.",
      expect.any(AbortSignal),
    );

    await act(async () => {
      pendingSummary.resolve("A useful summary.");
      await pendingSummary.promise;
    });

    expect(await screen.findByText("A useful summary.")).toBeVisible();
    expect(copyButton).toBeEnabled();

    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    await user.click(copyButton);

    expect(writeText).toHaveBeenCalledWith("A useful summary.");
    expect(screen.getByText("Summary copied to your clipboard.")).toBeVisible();
  });

  it("preserves input after an API failure and supports retry", async () => {
    summarizeTextMock
      .mockRejectedValueOnce(
        new SummarizationError({
          code: "MODEL_UNAVAILABLE",
          message: "The summarization model is temporarily unavailable.",
          retryable: true,
        }),
      )
      .mockResolvedValueOnce("Summary after retry.");
    const user = userEvent.setup();
    render(<SummarizerWorkspace />);

    const input = screen.getByRole("textbox", { name: "Text to summarize" });
    await user.type(input, "Keep this source text.");
    await user.click(screen.getByRole("button", { name: "Generate summary" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The summarization model is temporarily unavailable.",
    );
    expect(input).toHaveValue("Keep this source text.");

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Summary after retry.")).toBeVisible();
    expect(summarizeTextMock).toHaveBeenCalledTimes(2);
  });
});

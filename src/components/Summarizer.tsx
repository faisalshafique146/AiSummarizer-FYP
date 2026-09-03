import {
  useState,
  type ChangeEventHandler,
  type MouseEventHandler,
} from "react";
import loader from "../assets/loader.svg";
import {
  SummarizationError,
  type SummarizationApiErrorResponse,
  type SummarizationApiResponse,
  type SummarizationResult,
  type SummarizationResultResponse,
} from "../types";

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

async function query(input: string): Promise<string> {
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

function Summarizer() {
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const handleInputChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setInputValue(event.target.value);
  };

  const generateSummary = async (): Promise<void> => {
    try {
      setIsFetching(true);
      setOutputValue(await query(inputValue));
    } catch (error: unknown) {
      const summarizationError =
        error instanceof SummarizationError
          ? error
          : new SummarizationError(
              "invalid-response",
              "An unexpected summarization error occurred.",
              { cause: error },
            );
      console.error("Failed to fetch result:", summarizationError);
    } finally {
      setIsFetching(false);
    }
  };

  const handleButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
    void generateSummary();
  };

  const copyOutput = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(outputValue);
      alert("Text copied to clipboard!");
    } catch (error: unknown) {
      const clipboardError = new SummarizationError(
        "clipboard-error",
        "Failed to copy text.",
        { cause: error },
      );
      console.error("Failed to copy text:", clipboardError);
    }
  };

  const handleCopy: MouseEventHandler<HTMLButtonElement> = () => {
    void copyOutput();
  };

  return (
    <div>
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-3 rounded-lg bg-gray-700 px-3 py-6">
          <textarea
            className="mx-4 h-96 w-96 rounded-lg border border-gray-600 bg-gray-800 p-2.5 text-sm text-white placeholder-gray-400 focus:border-green-500 focus:ring-0 focus:outline-none"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter text here..."
          />
          <div className="group relative">
            <div className="absolute -inset-1 rounded-lg bg-linear-to-r from-rose-400 via-fuchsia-500 to-indigo-500 opacity-75 blur transition duration-500 group-hover:opacity-100" />
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={isFetching}
              className="relative rounded-lg bg-yellow-700 px-7 py-4 text-white"
            >
              {isFetching ? "Generating..." : "Get Result"}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-3 rounded-lg bg-gray-700 px-3 py-6">
          <textarea
            className="mx-4 h-96 w-96 rounded-lg border border-gray-600 bg-gray-800 p-2.5 text-sm text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-0 focus:outline-none"
            placeholder=""
            value={outputValue}
            readOnly
          />

          <div className="group relative">
            <div className="absolute -inset-1 rounded-lg bg-linear-to-r from-rose-400 via-fuchsia-500 to-indigo-500 opacity-75 blur transition duration-500 group-hover:opacity-100" />
            <button
              type="button"
              onClick={handleCopy}
              disabled={!outputValue}
              className="relative rounded-lg bg-green-600 px-7 py-4 text-white"
            >
              {isFetching ? (
                <span className="flex h-10 w-10 items-center justify-center">
                  <img src={loader} alt="loader" className="animate-spin" />
                </span>
              ) : (
                "Copy Text"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Summarizer;

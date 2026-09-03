import {
  useState,
  type ChangeEventHandler,
  type MouseEventHandler,
} from "react";
import loader from "../../assets/loader.svg";
import { summarizeText } from "./summarizationService";
import { SummarizationError } from "./types";

function SummarizerWorkspace() {
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setInputValue(event.target.value);
    setErrorMessage(null);
  };

  const generateSummary = async (): Promise<void> => {
    try {
      setIsFetching(true);
      setErrorMessage(null);
      setOutputValue(await summarizeText(inputValue));
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof SummarizationError
          ? error.message
          : "An unexpected summarization error occurred.",
      );
    } finally {
      setIsFetching(false);
    }
  };

  const handleSummarize: MouseEventHandler<HTMLButtonElement> = () => {
    void generateSummary();
  };

  const copyOutput = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(outputValue);
      alert("Text copied to clipboard!");
    } catch {
      setErrorMessage("Failed to copy the summary.");
    }
  };

  const handleCopy: MouseEventHandler<HTMLButtonElement> = () => {
    void copyOutput();
  };

  return (
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
            onClick={handleSummarize}
            disabled={isFetching}
            className="relative rounded-lg bg-yellow-700 px-7 py-4 text-white"
          >
            {isFetching ? "Generating..." : "Get Result"}
          </button>
        </div>
        {errorMessage ? (
          <p className="max-w-96 text-sm text-red-300" role="alert">
            {errorMessage}
          </p>
        ) : null}
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
  );
}

export default SummarizerWorkspace;

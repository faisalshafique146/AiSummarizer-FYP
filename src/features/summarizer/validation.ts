import {
  MAX_SUMMARIZE_TEXT_LENGTH,
  MIN_SUMMARIZE_WORD_COUNT,
  type SummarizeError,
} from "./types.ts";

type SummarizeTextValidation =
  | { valid: true; text: string }
  | { valid: false; error: SummarizeError };

export function countWords(value: string): number {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue.split(/\s+/u).length : 0;
}

export function validateSummarizeText(input: string): SummarizeTextValidation {
  const text = input.trim();

  if (!text) {
    return {
      valid: false,
      error: {
        code: "EMPTY_TEXT",
        message: "Enter text to summarize.",
        retryable: false,
      },
    };
  }

  if (text.length > MAX_SUMMARIZE_TEXT_LENGTH) {
    return {
      valid: false,
      error: {
        code: "INPUT_TOO_LARGE",
        message: `Text must be ${MAX_SUMMARIZE_TEXT_LENGTH.toLocaleString()} characters or fewer.`,
        retryable: false,
      },
    };
  }

  if (countWords(text) < MIN_SUMMARIZE_WORD_COUNT) {
    return {
      valid: false,
      error: {
        code: "INPUT_TOO_SHORT",
        message: `Add at least ${MIN_SUMMARIZE_WORD_COUNT.toLocaleString()} words so there is enough source material to summarize.`,
        retryable: false,
      },
    };
  }

  return { valid: true, text };
}

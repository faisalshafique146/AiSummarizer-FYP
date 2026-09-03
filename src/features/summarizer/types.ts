export const MAX_SUMMARIZE_TEXT_LENGTH = 12_000;

export interface SummarizeRequest {
  text: string;
}

export type SummarizeErrorCode =
  | "EMPTY_TEXT"
  | "INPUT_TOO_LARGE"
  | "INVALID_REQUEST"
  | "INVALID_RESPONSE"
  | "METHOD_NOT_ALLOWED"
  | "MODEL_UNAVAILABLE"
  | "NETWORK_FAILURE"
  | "RATE_LIMITED"
  | "SERVER_CONFIGURATION"
  | "UPSTREAM_FAILURE";

export interface SummarizeError {
  code: SummarizeErrorCode;
  message: string;
  retryable: boolean;
}

export type SummarizeResponse =
  | {
      ok: true;
      summary: string;
    }
  | {
      ok: false;
      error: SummarizeError;
    };

export class SummarizationError extends Error {
  readonly details: SummarizeError;

  constructor(details: SummarizeError, options?: ErrorOptions) {
    super(details.message, options);
    this.name = "SummarizationError";
    this.details = details;
  }
}

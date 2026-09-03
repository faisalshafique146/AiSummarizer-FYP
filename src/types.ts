export interface AuthenticatedUser {
  readonly uid: string;
  readonly displayName: string | null;
  readonly email: string | null;
}

export interface SignInFormValues {
  email: string;
  password: string;
}

export interface SignUpFormValues extends SignInFormValues {
  name: string;
  repeatedPassword: string;
}

export interface SummarizationResult {
  summary_text: string;
}

export interface SummarizationApiErrorResponse {
  error: string;
}

export type SummarizationResultResponse = readonly [
  SummarizationResult,
  ...SummarizationResult[],
];

export type SummarizationApiResponse =
  | SummarizationResultResponse
  | SummarizationApiErrorResponse;

export type SummarizationErrorCode =
  | "missing-token"
  | "network-error"
  | "provider-error"
  | "invalid-response"
  | "clipboard-error";

export class SummarizationError extends Error {
  readonly code: SummarizationErrorCode;

  constructor(
    code: SummarizationErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "SummarizationError";
    this.code = code;
  }
}

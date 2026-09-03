import { FirebaseError } from "firebase/app";

const authErrorMessages: Readonly<Record<string, string>> = {
  "auth/email-already-in-use":
    "Email already exists. Please use a different email.",
  "auth/invalid-credential": "The email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/user-disabled":
    "Your account has been disabled. Please contact support.",
  "auth/weak-password": "Choose a stronger password.",
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return authErrorMessages[error.code] ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected authentication error occurred.";
}

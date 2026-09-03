import { FirebaseError } from "firebase/app";

const authErrorMessages: Readonly<Record<string, string>> = {
  "auth/email-already-in-use":
    "An account already uses this email. Sign in instead.",
  "auth/invalid-credential": "The email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/missing-password": "Enter your password.",
  "auth/network-request-failed":
    "Unable to reach Firebase. Check your connection and try again.",
  "auth/operation-not-allowed":
    "Email and password authentication is currently unavailable.",
  "auth/password-does-not-meet-requirements":
    "Choose a password that meets the configured security requirements.",
  "auth/quota-exceeded":
    "Authentication is temporarily unavailable. Please try again later.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/user-disabled":
    "Your account has been disabled. Please contact support.",
  "auth/user-not-found": "The email or password is incorrect.",
  "auth/weak-password":
    "Choose a password that meets the configured security requirements.",
  "auth/wrong-password": "The email or password is incorrect.",
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return (
      authErrorMessages[error.code] ??
      "We couldn't complete authentication. Please try again."
    );
  }

  return "We couldn't complete authentication. Please try again.";
}

import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type User } from "firebase/auth";
import type { AuthenticatedUser } from "./types";

type FirebaseEnvironmentVariable =
  | "VITE_FIREBASE_API_KEY"
  | "VITE_FIREBASE_AUTH_DOMAIN"
  | "VITE_FIREBASE_PROJECT_ID"
  | "VITE_FIREBASE_APP_ID";

function requireEnvironmentVariable(name: FirebaseEnvironmentVariable): string {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(`Missing Firebase environment variable: ${name}`);
  }

  return value;
}

const firebaseConfig: FirebaseOptions = {
  apiKey: requireEnvironmentVariable("VITE_FIREBASE_API_KEY"),
  authDomain: requireEnvironmentVariable("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: requireEnvironmentVariable("VITE_FIREBASE_PROJECT_ID"),
  appId: requireEnvironmentVariable("VITE_FIREBASE_APP_ID"),
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function toAuthenticatedUser(user: User): AuthenticatedUser {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
  };
}

export { app, auth, toAuthenticatedUser };

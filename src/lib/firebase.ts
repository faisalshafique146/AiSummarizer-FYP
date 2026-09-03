import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";

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

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

export { firebaseAuth };

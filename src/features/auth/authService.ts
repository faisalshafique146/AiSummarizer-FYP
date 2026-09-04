import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Unsubscribe,
  type User,
} from "firebase/auth";
import { firebaseAuth } from "../../lib/firebase";
import type {
  AuthenticatedUser,
  SignInCredentials,
  SignUpDetails,
} from "./types";

function mapAuthenticatedUser(user: User): AuthenticatedUser {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
  };
}

export function observeAuthState(
  onUserChanged: (user: AuthenticatedUser | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onAuthStateChanged(
    firebaseAuth,
    (user) => {
      onUserChanged(user ? mapAuthenticatedUser(user) : null);
    },
    onError,
  );
}

export async function signInUser(
  credentials: SignInCredentials,
): Promise<AuthenticatedUser> {
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    credentials.email,
    credentials.password,
  );

  return mapAuthenticatedUser(credential.user);
}

export async function signUpUser(
  details: SignUpDetails,
): Promise<AuthenticatedUser> {
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    details.email,
    details.password,
  );

  await updateProfile(credential.user, { displayName: details.displayName });
  return mapAuthenticatedUser(credential.user);
}

export async function signOutUser(): Promise<void> {
  await signOut(firebaseAuth);
}

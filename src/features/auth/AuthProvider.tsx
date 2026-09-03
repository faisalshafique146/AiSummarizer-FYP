import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import AuthContext from "./AuthContext";
import {
  observeAuthState,
  signInUser,
  signOutUser,
  signUpUser,
} from "./authService";
import type {
  AuthContextValue,
  AuthenticatedUser,
  SignInCredentials,
  SignUpDetails,
} from "./types";

function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      observeAuthState(
        (authenticatedUser) => {
          setUser(authenticatedUser);
          setLoading(false);
        },
        (error) => {
          console.error("Firebase auth subscription failed:", error);
          setUser(null);
          setLoading(false);
        },
      ),
    [],
  );

  const signIn = useCallback(
    async (credentials: SignInCredentials): Promise<void> => {
      setLoading(true);
      try {
        await signInUser(credentials);
      } catch (error: unknown) {
        setLoading(false);
        throw error;
      }
    },
    [],
  );

  const signUp = useCallback(async (details: SignUpDetails): Promise<void> => {
    setLoading(true);
    try {
      await signUpUser(details);
    } catch (error: unknown) {
      setLoading(false);
      throw error;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await signOutUser();
    } catch (error: unknown) {
      setLoading(false);
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [loading, signIn, signOut, signUp, user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export default AuthProvider;

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
        () => {
          setUser(null);
          setLoading(false);
        },
      ),
    [],
  );

  const signIn = useCallback(async (
    credentials: SignInCredentials,
  ): Promise<void> => {
    const authenticatedUser = await signInUser(credentials);
    setUser(authenticatedUser);
  }, []);

  const signUp = useCallback(async (details: SignUpDetails): Promise<void> => {
    const authenticatedUser = await signUpUser(details);
    setUser(authenticatedUser);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await signOutUser();
    setUser(null);
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

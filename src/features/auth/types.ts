import type {
  SignInFormValues,
  SignUpFormValues,
} from "./authSchemas";

export interface AuthenticatedUser {
  readonly uid: string;
  readonly displayName: string | null;
  readonly email: string | null;
}

export type SignInCredentials = SignInFormValues;

export type SignUpDetails = Omit<SignUpFormValues, "confirmPassword">;

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  loading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (details: SignUpDetails) => Promise<void>;
  signOut: () => Promise<void>;
}

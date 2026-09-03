export interface AuthenticatedUser {
  readonly uid: string;
  readonly displayName: string | null;
  readonly email: string | null;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpDetails extends SignInCredentials {
  name: string;
}

export interface SignUpFormValues extends SignUpDetails {
  repeatedPassword: string;
}

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  loading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (details: SignUpDetails) => Promise<void>;
  signOut: () => Promise<void>;
}

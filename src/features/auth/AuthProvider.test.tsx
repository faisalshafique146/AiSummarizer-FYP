import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthProvider from "./AuthProvider";
import {
  observeAuthState,
  signInUser,
  signOutUser,
  signUpUser,
} from "./authService";
import type { AuthenticatedUser } from "./types";
import { useAuth } from "./useAuth";

vi.mock("./authService", () => ({
  observeAuthState: vi.fn(),
  signInUser: vi.fn(),
  signOutUser: vi.fn(),
  signUpUser: vi.fn(),
}));

const observeAuthStateMock = vi.mocked(observeAuthState);
const signInUserMock = vi.mocked(signInUser);
const signOutUserMock = vi.mocked(signOutUser);
const signUpUserMock = vi.mocked(signUpUser);

const signedInUser: AuthenticatedUser = {
  displayName: "Ada Reader",
  email: "ada@example.com",
  uid: "user-1",
};

const signedUpUser: AuthenticatedUser = {
  displayName: "Grace Writer",
  email: "grace@example.com",
  uid: "user-2",
};

function AuthProbe() {
  const { loading, signIn, signOut, signUp, user } = useAuth();

  return (
    <div>
      <p>{loading ? "loading" : (user?.displayName ?? "signed out")}</p>
      <button
        onClick={() => {
          void signIn({ email: "ada@example.com", password: "password123" });
        }}
        type="button"
      >
        Sign in probe
      </button>
      <button
        onClick={() => {
          void signUp({
            displayName: "Grace Writer",
            email: "grace@example.com",
            password: "password123",
          });
        }}
        type="button"
      >
        Sign up probe
      </button>
      <button
        onClick={() => {
          void signOut();
        }}
        type="button"
      >
        Sign out probe
      </button>
    </div>
  );
}

beforeEach(() => {
  observeAuthStateMock.mockImplementation((onUserChanged) => {
    onUserChanged(null);
    return vi.fn();
  });
  signInUserMock.mockResolvedValue(signedInUser);
  signUpUserMock.mockResolvedValue(signedUpUser);
  signOutUserMock.mockResolvedValue();
});

describe("AuthProvider", () => {
  it("updates its user immediately after auth operations complete", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(await screen.findByText("signed out")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Sign in probe" }));
    expect(await screen.findByText("Ada Reader")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Sign up probe" }));
    expect(await screen.findByText("Grace Writer")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Sign out probe" }));
    expect(await screen.findByText("signed out")).toBeVisible();
  });
});

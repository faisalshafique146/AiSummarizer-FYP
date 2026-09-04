import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FirebaseError } from "firebase/app";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignInPage from "./SignInPage";
import type { AuthContextValue } from "./types";
import { useAuth } from "./useAuth";

vi.mock("./useAuth", () => ({
  useAuth: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);
const signIn = vi.fn<AuthContextValue["signIn"]>();

beforeEach(() => {
  useAuthMock.mockReturnValue({
    loading: false,
    signIn,
    signOut: vi.fn<AuthContextValue["signOut"]>(),
    signUp: vi.fn<AuthContextValue["signUp"]>(),
    user: null,
  });
});

describe("SignInPage", () => {
  it("shows field errors instead of submitting empty credentials", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SignInPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Email is required.")).toBeVisible();
    expect(screen.getByText("Password is required.")).toBeVisible();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("maps Firebase failures to a friendly form error", async () => {
    signIn.mockRejectedValueOnce(
      new FirebaseError("auth/invalid-credential", "Internal Firebase details"),
    );
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SignInPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByRole("textbox", { name: "Email address" }), "reader@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The email or password is incorrect.",
    );
    expect(screen.queryByText("Internal Firebase details")).not.toBeInTheDocument();
  });
});

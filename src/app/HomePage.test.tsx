import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthContextValue, AuthenticatedUser } from "../features/auth/types";
import { useAuth } from "../features/auth/useAuth";
import ThemeProvider from "../features/theme/ThemeProvider";
import HomePage from "./HomePage";

vi.mock("../features/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);

function authValue(user: AuthenticatedUser | null): AuthContextValue {
  return {
    loading: false,
    signIn: vi.fn<AuthContextValue["signIn"]>(),
    signOut: vi.fn<AuthContextValue["signOut"]>(),
    signUp: vi.fn<AuthContextValue["signUp"]>(),
    user,
  };
}

beforeEach(() => {
  useAuthMock.mockReset();
});

describe("HomePage authentication states", () => {
  it("presents account entry points to signed-out visitors", () => {
    useAuthMock.mockReturnValue(authValue(null));

    render(
      <ThemeProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Keep the point. Cut the length." }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Start summarizing" })).toHaveAttribute(
      "href",
      "/sign-up",
    );
    expect(
      screen.queryByRole("textbox", { name: "Text to summarize" }),
    ).not.toBeInTheDocument();
  });

  it("shows the summarizer to authenticated users", () => {
    useAuthMock.mockReturnValue(
      authValue({
        displayName: "Ada Reader",
        email: "ada@example.com",
        uid: "user-1",
      }),
    );

    render(
      <ThemeProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Create a new summary." }),
    ).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Text to summarize" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Sign out of HiSumz" })).toBeVisible();
  });
});

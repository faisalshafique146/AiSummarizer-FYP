import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema } from "./authSchemas";

describe("authentication schemas", () => {
  it("normalizes a valid sign-in email", () => {
    const result = signInSchema.parse({
      email: "  reader@example.com  ",
      password: "password",
    });

    expect(result).toEqual({
      email: "reader@example.com",
      password: "password",
    });
  });

  it("rejects malformed sign-in values", () => {
    const result = signInSchema.safeParse({ email: "not-an-email", password: "" });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected sign-in validation to fail.");
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Enter a valid email address.",
          path: ["email"],
        }),
        expect.objectContaining({
          message: "Password is required.",
          path: ["password"],
        }),
      ]),
    );
  });

  it("rejects short and mismatched sign-up passwords", () => {
    const shortPassword = signUpSchema.safeParse({
      confirmPassword: "shorter",
      displayName: "Reader",
      email: "reader@example.com",
      password: "short",
    });

    expect(shortPassword.success).toBe(false);
    if (shortPassword.success) {
      throw new Error("Expected sign-up validation to fail.");
    }

    expect(shortPassword.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Passwords do not match.",
          path: ["confirmPassword"],
        }),
        expect.objectContaining({
          message: "Password must be at least 8 characters.",
          path: ["password"],
        }),
      ]),
    );
  });
});

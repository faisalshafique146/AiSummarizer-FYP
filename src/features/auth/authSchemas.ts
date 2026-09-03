import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .pipe(
    z
      .email("Enter a valid email address.")
      .max(254, "Email must be 254 characters or fewer."),
  );

const requiredPasswordSchema = z
  .string()
  .min(1, "Password is required.");

export const signInSchema = z.object({
  email: emailSchema,
  password: requiredPasswordSchema,
});

export const signUpSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Display name is required.")
      .max(50, "Display name must be 50 characters or fewer."),
    email: emailSchema,
    password: requiredPasswordSchema
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be 128 characters or fewer."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;

import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80).optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(24, "Username must be at most 24 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional(),
  image: z.string().url("Image must be a valid URL").optional(),
});

export const emailChangeRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
});

export const emailChangeConfirmSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

export const sessionRevokeSchema = z.object({
  sessionId: z.string().optional(),
  revokeOthers: z.boolean().optional(),
});

export const deleteAccountSchema = z.object({
  password: z.string().optional(),
  confirmation: z.literal("DELETE"),
});

export const preferencesSchema = z.object({
  theme: z.enum(["system", "light", "dark"]).default("system"),
  currency: z.enum(["USD", "EUR", "GBP", "JPY"]).default("USD"),
  language: z.enum(["en", "es", "fr", "de"]).default("en"),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type EmailChangeRequestInput = z.infer<typeof emailChangeRequestSchema>;
export type EmailChangeConfirmInput = z.infer<typeof emailChangeConfirmSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type SessionRevokeInput = z.infer<typeof sessionRevokeSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;

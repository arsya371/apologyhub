import { z } from "zod";
import { APOLOGY_CONSTRAINTS } from "./constants";

export const apologySchema = z.object({
  content: z
    .string()
    .min(APOLOGY_CONSTRAINTS.minLength, {
      message: `Apology must be at least ${APOLOGY_CONSTRAINTS.minLength} characters`,
    })
    .max(APOLOGY_CONSTRAINTS.maxLength, {
      message: `Apology must be less than ${APOLOGY_CONSTRAINTS.maxLength} characters`,
    }),
  toWho: z
    .string()
    .max(APOLOGY_CONSTRAINTS.toWhoMaxLength, {
      message: `Recipient must be less than ${APOLOGY_CONSTRAINTS.toWhoMaxLength} characters`,
    })
    .optional()
    .nullable(),
  fromWho: z
    .string()
    .max(APOLOGY_CONSTRAINTS.toWhoMaxLength, {
      message: `Sender name must be less than ${APOLOGY_CONSTRAINTS.toWhoMaxLength} characters`,
    })
    .optional()
    .nullable(),
  turnstileToken: z.string().min(1, { message: "Verification required" }),
});

export const apologyUpdateSchema = z.object({
  content: z
    .string()
    .min(APOLOGY_CONSTRAINTS.minLength)
    .max(APOLOGY_CONSTRAINTS.maxLength)
    .optional(),
  toWho: z.string().max(APOLOGY_CONSTRAINTS.toWhoMaxLength).optional().nullable(),
  fromWho: z.string().max(APOLOGY_CONSTRAINTS.toWhoMaxLength).optional().nullable(),
});

export const apologyFilterSchema = z.object({
  search: z.string().optional(),
  toWho: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["createdAt", "views"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const settingsSchema = z.object({
  siteName: z.string().min(1).max(100),
  announcement: z.string().max(500).optional().nullable(),
  showAnnouncement: z.boolean(),
  maxApologyLength: z.number().int().min(100).max(2000),
  enableModeration: z.boolean(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const analyticsFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum(["day", "week", "month"]).default("week"),
});

export const turnstileVerifySchema = z.object({
  token: z.string().min(1),
});

import z from "zod/v3";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string" })
    .min(2, { message: "Name too short. Minimum 2 character long" })
    .max(50, { message: "Name too long. Maximum 50 character long" }),
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 upercase letter",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number",
    })
    .optional(),
  phone: z
    .string({ invalid_type_error: "Address must be string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),
  address: z
    .string({ invalid_type_error: "Address must be string" })
    .max(200, { message: "Address cannot exceed 200 characters" })
    .optional(),
  role: z.enum([Role.RIDER, Role.DRIVER]).default(Role.RIDER),
});

export const updateUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string" })
    .min(2, { message: "Name too short. Minimum 2 character long" })
    .max(50, { message: "Name too long. Maximum 50 character long" })
    .optional(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 upercase letter",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number",
    })
    .optional(),
  phone: z
    .string({ invalid_type_error: "Address must be string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),
  address: z
    .string({ invalid_type_error: "Address must be string" })
    .max(200, { message: "Address cannot exceed 200 characters" })
    .optional(),
  role: z.enum(Object.values(Role) as [string]).optional(),
  isActive: z.enum(Object.values(IsActive) as [string]).optional(),
  isDeleted: z
    .boolean({ invalid_type_error: "isDeleted must be true or false" })
    .optional(),
});

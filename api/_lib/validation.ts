import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(3),
});
export const createUserSchema = z.object({
  username: z.string().regex(/^[a-z0-9_.-]+$/).min(3).max(50),
  password: z.string().min(6),
  displayName: z.string().min(2).max(100),
  waNumber: z.string().max(20).optional().nullable(),
  role: z.enum(["super_admin", "booking_admin"]),
  isActive: z.boolean().optional(),
});
export const updateUserSchema = createUserSchema.partial().extend({ password: z.string().min(6).optional() });
export const bookingSchema = z.object({
  schoolName: z.string().min(2).max(200),
  participantCount: z.number().int().positive(),
  picName: z.string().min(2).max(100),
  picWa: z.string().min(8).max(20),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  price: z.number().nonnegative().optional().nullable(),
  keterangan: z.string().max(1000).optional().nullable(),
  status: z.enum(["confirmed", "cancelled"]).optional(),
});
export const bookingUpdateSchema = bookingSchema.partial();
export const settingsSchema = z.object({
  landingWaNumber: z.string().min(8).max(20),
  landingWaLabel: z.string().max(100).optional(),
  buperName: z.string().max(100).optional(),
});

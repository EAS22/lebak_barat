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

export const bookingStatusValues = ["final", "negosiasi", "batal"] as const;

export const bookingSchema = z
  .object({
    schoolName: z.string().min(2).max(200),
    participantCount: z.number().int().positive(),
    picName: z.string().min(2).max(100),
    picWa: z
      .string()
      .max(20)
      .optional()
      .nullable()
      .transform((v) => (v === "" ? null : v)),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    price: z.number().nonnegative().optional().nullable(),
    keterangan: z.string().max(1000).optional().nullable(),
    status: z.enum(bookingStatusValues).optional(),
  })
  .superRefine((data, ctx) => {
    const status = data.status ?? "negosiasi";
    if (status === "final" && (!data.picWa || data.picWa.length < 8)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["picWa"],
        message: "No. WhatsApp PIC wajib diisi untuk status Final",
      });
    }
  });

export const bookingUpdateSchema = z.object({
  schoolName: z.string().min(2).max(200).optional(),
  participantCount: z.number().int().positive().optional(),
  picName: z.string().min(2).max(100).optional(),
  picWa: z
    .string()
    .max(20)
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  price: z.number().nonnegative().optional().nullable(),
  keterangan: z.string().max(1000).optional().nullable(),
  status: z.enum(bookingStatusValues).optional(),
});

export const settingsSchema = z.object({
  landingWaNumber: z.string().min(8).max(20).optional(),
  landingWaLabel: z.string().max(100).optional(),
  buperName: z.string().max(100).optional(),
  letterBody: z.string().max(10000).optional(),
  signKetua: z.string().max(100).optional(),
  signSekretaris: z.string().max(100).optional(),
  signKades: z.string().max(100).optional(),
  signDirBumdes: z.string().max(100).optional(),
});

export const eventSchema = z.object({
  institution: z.string().min(2).max(200),
  eventName: z.string().min(2).max(200),
  participantCount: z.number().int().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  keterangan: z.string().max(1000).optional().nullable(),
});
export const eventUpdateSchema = eventSchema.partial();

export const facilitySchema = z.object({
  name: z.string().min(2).max(200),
  category: z.enum(["utama", "opsional"]),
  sortOrder: z.number().int().optional(),
  icon: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});
export const facilityUpdateSchema = facilitySchema.partial();

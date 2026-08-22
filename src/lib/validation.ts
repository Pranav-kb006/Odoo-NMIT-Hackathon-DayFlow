import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

export const signupSchema = z.object({
  companyName: z.string().min(2, "Company name required"),
  companyCode: z
    .string()
    .regex(/^[A-Za-z]{2,4}$/, "2–4 letters, A–Z only")
    .transform((v) => v.toUpperCase()),
  fullName: z.string().min(2, "Your name required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

export const leaveApplySchema = z
  .object({
    startDate: z.string().date(),
    endDate: z.string().date(),
    reason: z.string().min(10, "Give a reason (10+ chars)"),
    attachmentUrl: z.string().min(1, "A supporting document is required"),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: "End date before start date",
    path: ["endDate"],
  });

export const employeeSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  department: z.string().min(2, "Department required"),
  designation: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["admin", "employee"]).default("employee"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LeaveApplyInput = z.infer<typeof leaveApplySchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;

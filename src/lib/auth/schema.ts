import { z } from "zod";
import { validationMessages } from "@/lib/utils/validationMessages";

/**
 * Credenciales de login y registro con las mismas reglas de fortaleza de contraseña.
 */
export const authSchema = z.object({
    email: z.string().trim().email({ message: validationMessages.authEmailInvalid }),
    password: z
        .string()
        .min(8, { message: validationMessages.authPasswordMinLength })
        .regex(/[a-zA-Z]/, { message: validationMessages.authPasswordRequiresLetter })
        .regex(/[0-9]/, { message: validationMessages.authPasswordRequiresNumber }),
});

export type AuthCredentials = z.infer<typeof authSchema>;

/**
 * Email para solicitar el enlace de recuperación de contraseña.
 */
export const forgotPasswordEmailSchema = z.object({
    email: z.string().trim().email({ message: validationMessages.authEmailInvalid }),
});

/**
 * Nueva contraseña y confirmación (misma política que registro).
 */
export const resetPasswordFormSchema = z
    .object({
        password: authSchema.shape.password,
        confirmPassword: authSchema.shape.password,
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: validationMessages.authPasswordMismatch,
        path: ["confirmPassword"],
    });

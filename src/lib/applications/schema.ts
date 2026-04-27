import { z } from "zod";
import { validationMessages } from "@/lib/utils/validationMessages";

export const APPLICATION_STATUS = [
    "applied",
    "interview",
    "offer",
    "rejected",
    "archived",
] as const;

/**
 * Devuelve un esquema zod para campos de texto opcionales y nullable.
 * Si el valor recibido es una cadena vacía (o solo espacios), lo convierte en `null`.
 * Si el valor es `undefined` no se valida.
 * Usado para campos como "role" y "description" donde el texto es opcional.
 * 
 * @param max Número máximo de caracteres permitidos
 * @returns Esquema zod para string opcional y nullable, con validación de longitud
 */
const optionalNullableText = (max: number, message: string) =>
    z.preprocess(
      (value) => {
        if (typeof value !== "string") return value;
        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
      },
      z.string().max(max, {
          message,
      }).nullable().optional(),
    );

const baseApplicationFields = {
    company: z
        .string()
        .trim()
        .min(1, { message: validationMessages.required("Empresa") })
        .max(100, { message: validationMessages.max("Empresa", 100) }),
    role: optionalNullableText(100, validationMessages.max("Puesto", 100)),
    description: optionalNullableText(
        2000,
        validationMessages.max("Descripción", 2000),
    ),
    status: z.enum(APPLICATION_STATUS, {
        message: validationMessages.invalidEnum("Estado", APPLICATION_STATUS),
    }),
};

/**
 * Schema para la creación de aplicaciones
 */
export const createApplicationSchema = z.object({
    ...baseApplicationFields,
    status: baseApplicationFields.status.optional(),
});

export const updateApplicationSchema = z.object({
    company: baseApplicationFields.company.optional(),
    role: baseApplicationFields.role.optional(),
    description: baseApplicationFields.description.optional(),
    status: baseApplicationFields.status.optional(),
});

export type ApplicationStatus = (typeof APPLICATION_STATUS)[number];
export type CreateApplicationInput = z.input<typeof createApplicationSchema>;
export type CreateApplicationData = z.output<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.input<typeof updateApplicationSchema>;

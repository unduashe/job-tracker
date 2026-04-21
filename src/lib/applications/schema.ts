import { z } from "zod";

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
const optionalNullableText = (max: number) =>
    z.preprocess(
      (value) => {
        if (typeof value !== "string") return value;
        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
      },
      z.string().max(max).nullable().optional(),
    );

/**
 * Schema para la creación de aplicaciones
 */
export const createApplicationSchema = z.object({
    company: z.string().trim().min(1).max(100),
    role: optionalNullableText(100),
    description: optionalNullableText(2000),
    status: z.enum(APPLICATION_STATUS).optional(),
});

export type ApplicationStatus = (typeof APPLICATION_STATUS)[number];
export type CreateApplicationInput = z.input<typeof createApplicationSchema>;
export type CreateApplicationData = z.output<typeof createApplicationSchema>;

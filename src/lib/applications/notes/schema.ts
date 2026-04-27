import { z } from "zod";

const validationMessages = {
    required: (s: string) => `${s} es un campo obligatorio`,
    max: (s: string, n: number) => `${s} no puede superar los ${n} caracteres`,
} as const;

const baseNoteFields = {
    subject: z
        .string()
        .trim()
        .min(1, { message: validationMessages.required("Asunto") })
        .max(150, { message: validationMessages.max("Asunto", 150) }),
    content: z
        .string()
        .trim()
        .min(1, { message: validationMessages.required("Contenido") })
        .max(5000, { message: validationMessages.max("Contenido", 5000) }),
};

export const createNoteSchema = z.object(baseNoteFields);

export const updateNoteSchema = z.object({
    subject: baseNoteFields.subject.optional(),
    content: baseNoteFields.content.optional(),
});

export type CreateNoteInput = z.input<typeof createNoteSchema>;
export type UpdateNoteInput = z.input<typeof updateNoteSchema>;

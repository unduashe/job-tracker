import { z } from "zod";
import { APPLICATION_STATUS } from "@/lib/applications/schema";

/**
 * Limites para la importación de modo invitado a autenticado
 */
const MAX_APPLICATIONS = 200;
const MAX_NOTES_PER_APPLICATION = 100;

/**
 * Schema del payload aceptado por `importGuestDataAction`.
 *
 * Se fuerza el `user_id` de la sesión por seguridad
 */
export const guestImportPayloadSchema = z.object({
    applications: z
        .array(
            z.object({
                tempId: z.string().min(1),
                company: z.string().trim().min(1).max(100),
                role: z.string().trim().max(100).nullable(),
                description: z.string().trim().max(2000).nullable(),
                status: z.enum(APPLICATION_STATUS),
                notes: z
                    .array(
                        z.object({
                            subject: z.string().trim().min(1).max(150),
                            content: z.string().trim().min(1).max(5000),
                        }),
                    )
                    .max(MAX_NOTES_PER_APPLICATION)
                    .default([]),
            }),
        )
        .min(1)
        .max(MAX_APPLICATIONS),
});

export type GuestImportPayload = z.infer<typeof guestImportPayloadSchema>;

/**
 * Construye el payload de importación a partir del snapshot de localStorage.
 * - Elimina los campos que agregamos temporalmente por no poder venir de bbdd (`id`, `user_id`, timestamps).
 * - Conserva `tempId` (id local generado) para emparejar notas con su app pero sin persistirse en Supabase
 */
export function buildImportPayloadFromSnapshot(
    snapshot: { applications: Array<{
        id: string;
        company: string;
        role: string | null;
        description: string | null;
        status: typeof APPLICATION_STATUS[number];
        notes?: Array<{ subject: string; content: string }>;
    }> },
): GuestImportPayload {
    return {
        applications: snapshot.applications.map((application) => ({
            tempId: application.id,
            company: application.company,
            role: application.role,
            description: application.description,
            status: application.status,
            notes: (application.notes ?? []).map((note) => ({
                subject: note.subject,
                content: note.content,
            })),
        })),
    };
}

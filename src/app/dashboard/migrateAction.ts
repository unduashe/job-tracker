"use server";

import { cookies } from "next/headers";
import { failFromError, fail, ok, type Result } from "@/lib/applications/dataApi/result";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import {
    guestImportPayloadSchema,
    type GuestImportPayload,
} from "@/lib/applications/local/migrate";
import type { ApplicationRow } from "@/lib/applications/types";
import type { NoteRow } from "@/lib/applications/notes/types";
import { createClient } from "@/lib/supabase/server";

type ImportedDataset = {
    applications: ApplicationRow[];
    notes: NoteRow[];
};

/**
 * Importa el dataset de un invitado a la cuenta autenticada actual.
 *
 * Seguridad:
 * - Exige sesión y nunca confía en `user_id` enviado por el cliente
 *   (no se acepta en el schema; se fuerza el `user.id` de la sesión).
 * - Valida el payload con zod, con límites de tamaño y de longitud por campo.
 * - Inserta en orden: candidaturas → mapeo de ids → notas, todo dentro de
 *   un solo Server Action para mantener el flujo simple y atómico desde el
 *   punto de vista del cliente.
 *
 * Devuelve `Result<ImportedDataset>` con las filas reales creadas para que
 * el cliente rehidrate el provider sin un re-fetch adicional.
 */
export async function importGuestDataAction(
    rawPayload: GuestImportPayload,
): Promise<Result<ImportedDataset>> {
    let payload: GuestImportPayload;
    try {
        payload = guestImportPayloadSchema.parse(rawPayload);
    } catch (error) {
        console.error("importGuestDataAction validation error:", error);
        return failFromError("No se pudieron importar los datos", error);
    }

    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const user = await getCurrentUser(supabase);

        const applicationsToInsert = payload.applications.map((application) => ({
            company: application.company,
            role: application.role,
            description: application.description,
            status: application.status,
            user_id: user.id,
        }));

        const { data: insertedApplications, error: applicationsError } = await supabase
            .from("applications")
            .insert(applicationsToInsert)
            .select("*");

        if (applicationsError || !insertedApplications) {
            console.error("importGuestDataAction insert applications:", applicationsError);
            return fail("No se pudieron importar los datos", [
                "No se han podido guardar las candidaturas",
            ]);
        }

        // Emparejamos por orden de inserción, Supabase preserva el orden del
        // array de `insert()` en la respuesta de `select()`.
        const tempIdToInsertedId = new Map<string, string>();
        payload.applications.forEach((application, index) => {
            const inserted = insertedApplications[index];
            if (inserted) {
                tempIdToInsertedId.set(application.tempId, inserted.id);
            }
        });

        const notesToInsert: Array<{
            application_id: string;
            subject: string;
            content: string;
        }> = [];

        for (const application of payload.applications) {
            const newId = tempIdToInsertedId.get(application.tempId);
            if (!newId) {
                continue;
            }

            for (const note of application.notes) {
                notesToInsert.push({
                    application_id: newId,
                    subject: note.subject,
                    content: note.content,
                });
            }
        }

        let insertedNotes: NoteRow[] = [];
        if (notesToInsert.length > 0) {
            const { data: notesData, error: notesError } = await supabase
                .from("notes")
                .insert(notesToInsert)
                .select("*");

            if (notesError || !notesData) {
                console.error("importGuestDataAction insert notes:", notesError);
                return fail("No se pudieron importar todas las notas", [
                    "Las candidaturas se importaron pero algunas notas fallaron",
                ]);
            }

            insertedNotes = notesData as NoteRow[];
        }

        const notesByApplication = new Map<string, NoteRow[]>();
        for (const note of insertedNotes) {
            const list = notesByApplication.get(note.application_id) ?? [];
            list.push(note);
            notesByApplication.set(note.application_id, list);
        }

        const enriched: ApplicationRow[] = (insertedApplications as ApplicationRow[]).map(
            (application) => ({
                ...application,
                notes: notesByApplication.get(application.id) ?? [],
            }),
        );

        return ok({ applications: enriched, notes: insertedNotes });
    } catch (error) {
        console.error("importGuestDataAction error:", error);
        return failFromError("No se pudieron importar los datos", error);
    }
}

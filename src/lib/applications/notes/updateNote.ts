import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { updateNoteSchema } from "./schema";
import type { NoteRow } from "./types";

/**
 * Actualiza una nota existente del usuario autenticado.
 */
export async function updateNote(noteId: string, input: unknown): Promise<NoteRow> {
    const parsedInput = updateNoteSchema.parse(input);
    const payload: Partial<Pick<NoteRow, "subject" | "content">> = {};

    if (parsedInput.subject !== undefined) {
        payload.subject = parsedInput.subject;
    }

    if (parsedInput.content !== undefined) {
        payload.content = parsedInput.content;
    }

    if (Object.keys(payload).length === 0) {
        throw new Error("No se han detectado cambios");
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const user = await getCurrentUser(supabase);

    const { data: ownedNote, error: ownedNoteError } = await supabase
        .from("notes")
        .select("id, application_id, applications!inner(user_id)")
        .eq("id", noteId)
        .eq("applications.user_id", user.id)
        .maybeSingle();

    if (ownedNoteError) {
        console.error("Fallo al validar permisos de la nota:", ownedNoteError);
        throw new Error("No se ha podido actualizar la nota");
    }

    if (!ownedNote) {
        throw new Error("No se ha encontrado la nota o no tienes permisos");
    }

    const { data, error } = await supabase
        .from("notes")
        .update(payload)
        .eq("id", noteId)
        .eq("application_id", ownedNote.application_id)
        .select("*")
        .single();

    if (error) {
        console.error("Fallo al actualizar la nota:", error);
        throw new Error("No se ha podido actualizar la nota");
    }

    if (!data) {
        throw new Error("No se ha encontrado la nota o no tienes permisos");
    }

    return data as NoteRow;
}

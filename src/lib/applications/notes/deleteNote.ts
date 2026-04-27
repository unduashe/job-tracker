import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";

/**
 * Elimina una nota del usuario autenticado.
 */
export async function deleteNote(noteId: string): Promise<void> {
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
        throw new Error("No se ha podido eliminar la nota");
    }

    if (!ownedNote) {
        throw new Error("No se ha encontrado la nota o no tienes permisos");
    }

    const { data, error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId)
        .eq("application_id", ownedNote.application_id)
        .select("id")
        .maybeSingle();

    if (error) {
        console.error("Fallo al eliminar la nota:", error);
        throw new Error("No se ha podido eliminar la nota");
    }

    if (!data) {
        throw new Error("No se ha encontrado la nota o no tienes permisos");
    }
}

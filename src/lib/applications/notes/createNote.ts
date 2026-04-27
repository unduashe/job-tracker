import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { createNoteSchema } from "./schema";
import type { NoteRow } from "./types";

/**
 * Crea una nota asociada a una candidatura del usuario autenticado.
 */
export async function createNote(applicationId: string, input: unknown): Promise<NoteRow> {
    const parsedInput = createNoteSchema.parse(input);
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const user = await getCurrentUser(supabase);

    const payload = {
        subject: parsedInput.subject,
        content: parsedInput.content,
        application_id: applicationId,
    };

    const { data: ownedApplication, error: ownedApplicationError } = await supabase
        .from("applications")
        .select("id")
        .eq("id", applicationId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (ownedApplicationError) {
        console.error("Fallo al validar permisos de la candidatura:", ownedApplicationError);
        throw new Error("No se ha podido crear la nota");
    }

    if (!ownedApplication) {
        throw new Error("No se ha encontrado la candidatura o no tienes permisos");
    }

    const { data, error } = await supabase
        .from("notes")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        console.error("Fallo al crear la nota:", error);
        throw new Error("No se ha podido crear la nota");
    }

    if (!data) {
        throw new Error("La inserción de la nota no ha devuelto datos");
    }

    return data as NoteRow;
}

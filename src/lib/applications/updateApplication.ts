import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { updateApplicationSchema } from "./schema";
import type { ApplicationRow } from "./types";

/**
 * Actualiza una aplicación existente del usuario autenticado.
 */
export async function updateApplication(
    id: string,
    input: unknown,
): Promise<ApplicationRow> {
    const parsedInput = updateApplicationSchema.parse(input);
    const payload: Partial<
        Pick<ApplicationRow, "company" | "role" | "description" | "status">
    > = {};

    if (parsedInput.company !== undefined) {
        payload.company = parsedInput.company;
    }

    if (parsedInput.role !== undefined) {
        payload.role = parsedInput.role;
    }

    if (parsedInput.description !== undefined) {
        payload.description = parsedInput.description;
    }

    if (parsedInput.status !== undefined) {
        payload.status = parsedInput.status;
    }

    if (Object.keys(payload).length === 0) {
        throw new Error("No se han proporcionado datos para actualizar");
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const user = await getCurrentUser(supabase);

    const { data: ownedApplication, error: ownedApplicationError } = await supabase
        .from("applications")
        .select("id, user_id")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

    if (ownedApplicationError) {
        console.error("Fallo al validar permisos de la aplicación:", ownedApplicationError);
        throw new Error("No se ha podido actualizar la aplicación");
    }

    if (!ownedApplication) {
        throw new Error("No se ha encontrado la aplicación o no tienes permisos");
    }

    const { data, error } = await supabase
        .from("applications")
        .update(payload)
        .eq("id", id)
        .eq("user_id", ownedApplication.user_id)
        .select("*")
        .single();

    if (error) {
        console.error("Fallo al ejecutar actualización de la aplicación:", error);
        throw new Error("No se ha podido actualizar la aplicación");
    }

    if (!data) {
        throw new Error("No se ha encontrado la aplicación o no tienes permisos");
    }

    return data as ApplicationRow;
}

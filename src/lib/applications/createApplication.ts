import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import {
    createApplicationSchema,
    type CreateApplicationInput,
} from "./schema";
import type { ApplicationRow } from "./types";

/**
 * Crea una nueva aplicación validada y asociada al usuario autenticado.
 */
export async function createApplication(
    input: CreateApplicationInput,
): Promise<ApplicationRow> {
    const parsedInput = createApplicationSchema.parse(input);
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const user = await getCurrentUser(supabase);

    const payload = {
        company: parsedInput.company,
        role: parsedInput.role ?? null,
        description: parsedInput.description ?? null,
        status: parsedInput.status ?? "applied",
        user_id: user.id,
    };

    const { data, error } = await supabase
        .from("applications")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        console.error(`Fallo al crear la aplicación: ${error.message}`)
        throw new Error("No se ha podido crear la aplicación.");
    }

    if (!data) {
        throw new Error("La inserción de la aplicación no ha devuelto datos");
    }

    return data;
}

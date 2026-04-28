import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationRow } from "./types";

/**
 * Obtiene todas las aplicaciones del usuario autenticado.
 */
export async function getApplications(): Promise<ApplicationRow[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const user = await getCurrentUser(supabase);

    const { data, error } = await supabase
        .from("applications")
        .select(`
            *,
            notes (*)
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("Fallo al obtener aplicaciones:", error);
        throw new Error("No se han podido obtener las aplicaciones");
    }

    return (data ?? []) as ApplicationRow[];
}

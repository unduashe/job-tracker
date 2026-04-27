import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";

/**
 * Elimina una aplicación del usuario autenticado.
 */
export async function deleteApplication(id: string): Promise<void> {
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
        throw new Error("No se ha podido eliminar la aplicación");
    }

    if (!ownedApplication) {
        throw new Error("No se ha encontrado la aplicación o no tienes permisos");
    }

    const { data, error } = await supabase
        .from("applications")
        .delete()
        .eq("id", id)
        .eq("user_id", ownedApplication.user_id)
        .select("id")
        .maybeSingle();

    if (error) {
        console.error("Fallo al ejecutar borrado de la aplicación:", error);
        throw new Error("No se ha podido eliminar la aplicación");
    }

    if (!data) {
        throw new Error("No se ha encontrado la aplicación o no tienes permisos");
    }
}

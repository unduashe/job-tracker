import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Obtiene el usuario autenticado de Supabase para la request actual.
 */
export async function getCurrentUser(supabase: SupabaseClient): Promise<User> {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        console.error("getCurrentUser error: ", error?.message ?? "No hay usuario en la sesión");
        throw new Error("Usuario no autenticado");
    }

    return data.user;
}

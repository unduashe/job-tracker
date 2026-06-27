import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Resultado de detección de sesión para el dashboard.
 * `auth` + `email` para usuarios autenticados, `guest` para usuarios sin autenticar 
 * o cuando hay error de supabase para resiliencia de app.
 */
export type DashboardSession =
    | { mode: "auth"; email: string }
    | { mode: "guest" };

/**
 * Lee la sesión actual de Supabase y la traduce a un `DashboardSession`.
 */
export async function getDashboardSession(): Promise<DashboardSession> {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user || !data.user.email) {
            return { mode: "guest" };
        }

        return {
            mode: "auth",
            email: data.user.email,
        };
    } catch (error) {
        console.error("getDashboardSession error:", error);
        return { mode: "guest" };
    }
}

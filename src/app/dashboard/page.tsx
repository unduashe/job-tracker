import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Muestra un saludo al usuario autenticado.
 */
export default async function DashboardPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data } = await supabase.auth.getUser();


    const email = data.user?.email ?? "usuario";

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
            <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center shadow-md">
                <h1 className="text-2xl font-semibold text-zinc-900">Hola {email}</h1>
            </section>
        </main>
    );
}

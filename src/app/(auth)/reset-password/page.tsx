import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";

/**
 * Restablecimiento de contraseña tras validar el enlace del correo (`/auth/callback`).
 */
export default async function ResetPasswordPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
        redirect("/login");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
            <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-zinc-50 p-8 shadow-md">
                <h1 className="mb-6 text-center text-2xl font-semibold text-zinc-900">Nueva contraseña</h1>
                <ResetPasswordForm userEmail={user.email} />
            </section>
        </main>
    );
}

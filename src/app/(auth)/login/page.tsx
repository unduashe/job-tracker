import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

/**
 * Renderiza la pantalla de inicio de sesión.
 */
export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
            <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-zinc-50 p-8 shadow-md">
                <h1 className="mb-6 text-center text-2xl font-semibold text-zinc-900">Iniciar sesión</h1>
                <Suspense fallback={<div className="min-h-[280px] animate-pulse rounded-lg bg-zinc-100/80" />}>
                    <LoginForm />
                </Suspense>
            </section>
        </main>
    );
}

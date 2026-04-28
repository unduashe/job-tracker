import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

/**
 * Renderiza la pantalla de inicio de sesión.
 */
export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-surface-canvas px-4">
            <section className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-panel p-8 shadow-card">
                <h1 className="mb-6 text-center text-2xl font-semibold text-foreground">Iniciar sesión</h1>
                <Suspense fallback={<div className="min-h-[280px] animate-pulse rounded-lg bg-surface-muted" />}>
                    <LoginForm />
                </Suspense>
            </section>
        </main>
    );
}

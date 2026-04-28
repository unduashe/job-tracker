import { RegisterForm } from "@/components/auth/RegisterForm";

/**
 * Renderiza la pantalla de creación de cuenta.
 */
export default function RegisterPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-surface-canvas px-4">
            <section className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-panel p-8 shadow-card">
                <h1 className="mb-6 text-center text-2xl font-semibold text-foreground">Crear cuenta</h1>
                <RegisterForm />
            </section>
        </main>
    );
}

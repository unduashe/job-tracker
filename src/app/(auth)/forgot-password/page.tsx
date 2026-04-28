import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

/**
 * Solicitud de enlace de restablecimiento de contraseña.
 */
export default function ForgotPasswordPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-surface-canvas px-4">
            <section className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-panel p-8 shadow-card">
                <h1 className="mb-2 text-center text-2xl font-semibold text-foreground">
                    ¿Olvidaste tu contraseña?
                </h1>
                <p className="mb-6 text-center text-sm text-foreground-muted">
                    Introduce tu correo y te enviaremos un enlace para elegir una nueva contraseña.
                </p>
                <ForgotPasswordForm />
            </section>
        </main>
    );
}

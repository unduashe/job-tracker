import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

/**
 * Solicitud de enlace de restablecimiento de contraseña.
 */
export default function ForgotPasswordPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
            <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-zinc-50 p-8 shadow-md">
                <h1 className="mb-2 text-center text-2xl font-semibold text-zinc-900">
                    ¿Olvidaste tu contraseña?
                </h1>
                <p className="mb-6 text-center text-sm text-zinc-600">
                    Introduce tu correo y te enviaremos un enlace para elegir una nueva contraseña.
                </p>
                <ForgotPasswordForm />
            </section>
        </main>
    );
}

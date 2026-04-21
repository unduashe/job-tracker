"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginFormAction, type LoginFormState } from "./actions";

const INITIAL_STATE: LoginFormState = {
    success: false,
    message: "",
};

/**
 * Renderiza una pantalla mínima de inicio de sesión.
 */
export default function LoginPage() {
    const [state, formAction] = useActionState(loginFormAction, INITIAL_STATE);

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
            <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-zinc-50 p-8 shadow-md">
                <h1 className="mb-6 text-center text-2xl font-semibold text-zinc-900">
                    Iniciar sesión
                </h1>

                <form action={formAction} className="space-y-5">
                    <div className="space-y-2">
                        <label
                            className="block text-sm font-medium text-zinc-700"
                            htmlFor="email"
                        >
                            Correo electrónico
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                            title="Introduce un correo electrónico válido"
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            className="block text-sm font-medium text-zinc-700"
                            htmlFor="password"
                        >
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            minLength={1}
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
                            placeholder="Tu contraseña"
                        />
                    </div>

                    <SubmitButton />

                    {state.message ? (
                        <p
                            aria-live="polite"
                            className={`text-sm ${
                                state.success ? "text-green-700" : "text-red-700"
                            }`}
                        >
                            {state.message}
                        </p>
                    ) : null}
                </form>
            </section>
        </main>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
        >
            {pending ? "Iniciando sesión..." : "Entrar"}
        </button>
    );
}

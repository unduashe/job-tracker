"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { sendResetPasswordEmailAction } from "@/app/(auth)/actions";
import { ErrorToast } from "@/components/ErrorToast";
import { Button } from "@/components/ui/Button";

type ErrorState = {
    title: string;
    details: string[];
};

/**
 * Solicita el enlace de restablecimiento de contraseña por correo.
 */
export function ForgotPasswordForm() {
    const [isPending, startTransition] = useTransition();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorState, setErrorState] = useState<ErrorState | null>(null);

    const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        setSuccessMessage(null);

        const formData = new FormData(formElement);
        const email = formData.get("email");

        if (typeof email !== "string") {
            setErrorState({
                title: "No se pudo enviar el correo",
                details: ["Revisa el email e inténtalo de nuevo."],
            });
            return;
        }

        startTransition(async () => {
            const response = await sendResetPasswordEmailAction(email.trim());

            if (!response.success) {
                setErrorState({
                    title: "No se pudo enviar el correo",
                    details: [response.message],
                });
                return;
            }

            setErrorState(null);
            setSuccessMessage(response.message);
            formElement.reset();
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-700" htmlFor="forgot-email">
                        Correo electrónico
                    </label>
                    <input
                        id="forgot-email"
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

                <Button type="submit" variant="primary" disabled={isPending} className="w-full">
                    {isPending ? "Enviando…" : "Enviar enlace"}
                </Button>

                {successMessage ? (
                    <p aria-live="polite" className="text-sm text-green-700">
                        {successMessage}
                    </p>
                ) : null}

                <p className="text-center text-sm text-zinc-600">
                    <Link href="/login" className="font-medium text-zinc-900 underline underline-offset-2">
                        Volver a iniciar sesión
                    </Link>
                </p>
            </form>

            <ErrorToast
                isOpen={errorState !== null}
                title={errorState?.title ?? ""}
                details={errorState?.details ?? []}
                onClose={() => setErrorState(null)}
            />
        </>
    );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ErrorToast } from "@/components/ErrorToast";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { registerWithPassword } from "@/app/(auth)/actions";
import { isNextRedirectError } from "@/lib/auth/isNextRedirectError";

type FeedbackState = {
    success: boolean;
    message: string;
};

type ErrorState = {
    title: string;
    details: string[];
};

/**
 * Formulario de registro basado en submit controlado por evento y FormData.
 */
export function RegisterForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [feedbackState, setFeedbackState] = useState<FeedbackState | null>(null);
    const [errorState, setErrorState] = useState<ErrorState | null>(null);

    const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formElement = event.currentTarget;

        const formData = new FormData(formElement);
        const email = formData.get("email");
        const password = formData.get("password");

        if (typeof email !== "string" || typeof password !== "string") {
            setErrorState({
                title: "No se pudo crear la cuenta",
                details: ["Revisa los datos del formulario e inténtalo de nuevo."],
            });
            return;
        }

        setFeedbackState(null);

        startTransition(async () => {
            try {
                const response = await registerWithPassword(email.trim(), password);

                if (!response.success) {
                    const details =
                        response.details && response.details.length > 0
                            ? response.details
                            : [response.message];
                    setErrorState({
                        title: "No se pudo crear la cuenta",
                        details,
                    });
                    return;
                }

                setFeedbackState(response);
                formElement.reset();
            } catch (error) {
                if (isNextRedirectError(error)) {
                    router.replace("/dashboard");
                    return;
                }

                console.error("Error al registrar:", error);
                setErrorState({
                    title: "No se pudo crear la cuenta",
                    details: ["Ha ocurrido un error. Inténtalo de nuevo más tarde"],
                });
            }
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground" htmlFor="email">
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
                        className="w-full rounded-lg border border-border-strong bg-surface-card px-3 py-2 text-foreground outline-none transition placeholder:text-foreground-subtle focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        placeholder="tu@email.com"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground" htmlFor="register-password">
                        Contraseña
                    </label>
                    <PasswordInput
                        id="register-password"
                        name="password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        placeholder="Mínimo 8 caracteres, letra y número"
                    />
                </div>

                <Button type="submit" variant="primary" disabled={isPending} className="w-full">
                    {isPending ? "Creando cuenta..." : "Crear cuenta"}
                </Button>

                {feedbackState?.success ? (
                    <p aria-live="polite" className="text-sm text-success-700">
                        {feedbackState.message}
                    </p>
                ) : null}

                <p className="text-center text-sm text-foreground-muted">
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/login" className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-600">
                        Inicia sesión
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

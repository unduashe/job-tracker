"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ErrorToast } from "@/components/ErrorToast";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { loginWithPassword } from "@/app/(auth)/actions";

type ErrorState = {
    title: string;
    details: string[];
};

/**
 * Formulario de login basado en submit controlado por evento y FormData.
 */
export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [errorState, setErrorState] = useState<ErrorState | null>(null);

    const bannerMessage = searchParams.get("message");
    const bannerError = searchParams.get("error");

    const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        if (typeof email !== "string" || typeof password !== "string") {
            setErrorState({
                title: "No se pudo iniciar sesión",
                details: ["Revisa los datos del formulario e inténtalo de nuevo."],
            });
            return;
        }

        startTransition(async () => {
            const response = await loginWithPassword(email.trim(), password);

            if (!response.success) {
                const details =
                    response.details && response.details.length > 0
                        ? response.details
                        : [response.message];
                setErrorState({
                    title: "No se pudo iniciar sesión",
                    details,
                });
                return;
            }

            router.push("/dashboard");
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-5">
                {bannerMessage ? (
                    <p aria-live="polite" className="rounded-lg border border-success-100 bg-success-50 px-3 py-2 text-sm text-success-700">
                        {bannerMessage}
                    </p>
                ) : null}
                {bannerError ? (
                    <p aria-live="assertive" className="rounded-lg border border-danger-100 bg-danger-50 px-3 py-2 text-sm text-danger-700">
                        {bannerError}
                    </p>
                ) : null}

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
                    <label className="block text-sm font-medium text-foreground" htmlFor="login-password">
                        Contraseña
                    </label>
                    <PasswordInput
                        id="login-password"
                        name="password"
                        autoComplete="current-password"
                        required
                        minLength={8}
                        placeholder="Mínimo 8 caracteres, letra y número"
                    />
                    <p className="text-right text-sm">
                        <Link
                            href="/forgot-password"
                            className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-600"
                        >
                            Olvidé mi contraseña
                        </Link>
                    </p>
                </div>

                <Button type="submit" variant="primary" disabled={isPending} className="w-full">
                    {isPending ? "Iniciando sesión..." : "Entrar"}
                </Button>

                <p className="text-center text-sm text-foreground-muted">
                    ¿No tienes cuenta?{" "}
                    <Link href="/register" className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-600">
                        Regístrate
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

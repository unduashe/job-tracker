"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
    const [isPending, startTransition] = useTransition();
    const [errorState, setErrorState] = useState<ErrorState | null>(null);

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
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-700" htmlFor="email">
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
                    <label className="block text-sm font-medium text-zinc-700" htmlFor="login-password">
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
                </div>

                <Button type="submit" variant="primary" disabled={isPending} className="w-full">
                    {isPending ? "Iniciando sesión..." : "Entrar"}
                </Button>

                <p className="text-center text-sm text-zinc-600">
                    ¿No tienes cuenta?{" "}
                    <Link href="/register" className="font-medium text-zinc-900 underline underline-offset-2">
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

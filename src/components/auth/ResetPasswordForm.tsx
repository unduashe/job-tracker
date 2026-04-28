"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updatePasswordAction } from "@/app/(auth)/actions";
import { isNextRedirectError } from "@/lib/auth/isNextRedirectError";
import { ErrorToast } from "@/components/ErrorToast";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { validationMessages } from "@/lib/utils/validationMessages";

type ErrorState = {
    title: string;
    details: string[];
};

type ResetPasswordFormProps = {
    userEmail: string;
};

/**
 * Formulario de nueva contraseña, el email es solo informativo.
 */
export function ResetPasswordForm({ userEmail }: ResetPasswordFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [errorState, setErrorState] = useState<ErrorState | null>(null);

    const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        if (typeof password !== "string" || typeof confirmPassword !== "string") {
            setErrorState({
                title: "No se pudo actualizar la contraseña",
                details: ["Revisa los campos e inténtalo de nuevo."],
            });
            return;
        }

        startTransition(async () => {
            try {
                const response = await updatePasswordAction(password, confirmPassword);

                if (!response.success) {
                    setErrorState({
                        title: "No se pudo actualizar la contraseña",
                        details: [response.message],
                    });
                }
            } catch (error) {
                if (isNextRedirectError(error)) {
                    router.replace(
                        `/login?message=${encodeURIComponent(validationMessages.authPasswordUpdated)}`,
                    );
                    return;
                }

                console.error("Error al actualizar contraseña:", error);
                setErrorState({
                    title: "No se pudo actualizar la contraseña",
                    details: [validationMessages.authGenericError],
                });
            }
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground" htmlFor="reset-email">
                        Correo electrónico
                    </label>
                    <input
                        id="reset-email"
                        type="email"
                        defaultValue={userEmail}
                        disabled
                        readOnly
                        autoComplete="email"
                        className="w-full cursor-not-allowed rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-foreground-muted outline-none"
                        tabIndex={-1}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground" htmlFor="reset-password">
                        Nueva contraseña
                    </label>
                    <PasswordInput
                        id="reset-password"
                        name="password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        placeholder="Mínimo 8 caracteres, letra y número"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        className="block text-sm font-medium text-foreground"
                        htmlFor="reset-confirm-password"
                    >
                        Confirmar contraseña
                    </label>
                    <PasswordInput
                        id="reset-confirm-password"
                        name="confirmPassword"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        placeholder="Repite la contraseña"
                    />
                </div>

                <Button type="submit" variant="primary" disabled={isPending} className="w-full">
                    {isPending ? "Guardando…" : "Actualizar contraseña"}
                </Button>
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

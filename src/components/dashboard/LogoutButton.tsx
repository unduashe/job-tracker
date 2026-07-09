"use client";

import { useState, useTransition } from "react";
import { logoutAction } from "@/app/dashboard/actions";
import { ErrorToast } from "@/components/ErrorToast";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { LogOutIcon } from "@/components/ui/icons";

type ErrorState = {
    title: string;
    details: string[];
};

type LogoutButtonProps = {
    variant: "icon" | "full";
    className?: string;
};

/**
 * Control de cierre de sesión con estado de carga y manejo de errores.
 */
export function LogoutButton({ variant, className = "" }: LogoutButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [errorState, setErrorState] = useState<ErrorState | null>(null);

    const handleLogout = () => {
        setErrorState(null);

        startTransition(async () => {
            try {
                await logoutAction();
            } catch (error) {
                console.error("logout error:", error);
                setErrorState({
                    title: "No se pudo cerrar sesión",
                    details: ["Inténtalo de nuevo en un momento."],
                });
            }
        });
    };

    return (
        <>
            {variant === "icon" ? (
                <IconButton
                    type="button"
                    onClick={handleLogout}
                    ariaLabel={isPending ? "Cerrando sesión…" : "Cerrar sesión"}
                    icon={<LogOutIcon />}
                    disabled={isPending}
                    className={className}
                />
            ) : (
                <Button
                    type="button"
                    variant="secondary"
                    onClick={handleLogout}
                    disabled={isPending}
                    aria-busy={isPending}
                    className={["inline-flex items-center gap-2", className].filter(Boolean).join(" ")}
                >
                    <LogOutIcon size={18} />
                    {isPending ? "Cerrando sesión…" : "Cerrar sesión"}
                </Button>
            )}

            <ErrorToast
                isOpen={errorState !== null}
                title={errorState?.title ?? ""}
                details={errorState?.details ?? []}
                onClose={() => setErrorState(null)}
            />
        </>
    );
}

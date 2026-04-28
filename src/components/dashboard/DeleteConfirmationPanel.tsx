"use client";

import { Button } from "@/components/ui/Button";

type DeleteConfirmationPanelProps = {
    deleteTargetType: "application" | "note";
    company: string;
    role: string | null;
    isDeleting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

/**
 * Panel de confirmación reutilizable para eliminar aplicación o nota.
 */
export function DeleteConfirmationPanel({
    deleteTargetType,
    company,
    role,
    isDeleting,
    onCancel,
    onConfirm,
}: DeleteConfirmationPanelProps) {
    return (
        <>
            <div className="space-y-3">
                <p className="text-sm text-foreground-muted text-pretty text-justify">
                    {deleteTargetType === "application"
                        ? `¿Estás seguro de que quieres eliminar la candidatura a ${company}${role ? ` para el puesto ${role}` : ""}?`
                        : "¿Estás seguro de que quieres eliminar esta nota?"}
                </p>
            </div>
            <footer className="mt-6 flex w-full gap-2">
                <Button
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="flex-1"
                >
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1"
                >
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                </Button>
            </footer>
        </>
    );
}

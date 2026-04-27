"use client";

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
                <p className="text-sm text-zinc-700">
                    {deleteTargetType === "application"
                        ? `¿Estás seguro de que quieres eliminar la candidatura a ${company}${role ? ` para el puesto ${role}` : ""}?`
                        : "¿Estás seguro de que quieres eliminar esta nota?"}
                </p>
            </div>
            <footer className="mt-6 flex w-full gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="flex-1 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:cursor-pointer hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                >
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                </button>
            </footer>
        </>
    );
}

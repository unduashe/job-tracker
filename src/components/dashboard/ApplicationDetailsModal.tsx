"use client";

import { useState } from "react";
import { deleteApplicationAction } from "@/app/dashboard/actions";
import { ApplicationForm } from "@/components/dashboard/ApplicationForm";
import { APPLICATION_STATUS_LABELS } from "@/lib/applications/constants";
import type { ApplicationRow } from "@/lib/applications/types";

type ApplicationDetailsModalProps = {
    application: ApplicationRow | null;
    isOpen: boolean;
    onClose: () => void;
};

type Mode = "view" | "edit" | "confirmDelete";

/**
 * Modal dinámico para visualizar y editar una candidatura.
 */
export function ApplicationDetailsModal({
    application,
    isOpen,
    onClose,
}: ApplicationDetailsModalProps) {
    const [mode, setMode] = useState<Mode>("view");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleClose = () => {
        if (isDeleting) {
            return;
        }
        setMode("view");
        setIsDeleting(false);
        onClose();
    };

    const handleDelete = async () => {
        if (!application || isDeleting) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteApplicationAction(application.id);

        if (result.success) {
            onClose();
            setMode("view");
            setIsDeleting(false);
            return;
        }

        alert(result.message ?? "No se pudo eliminar la aplicación");
        setIsDeleting(false);
    };

    if (!isOpen || !application) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/50 p-4" onClick={handleClose}>
            <div
                className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-900">
                        {mode === "view"
                            ? "Detalle de candidatura"
                            : mode === "edit"
                              ? "Editar candidatura"
                              : "Eliminar candidatura"}
                    </h3>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isDeleting}
                        aria-label="Cerrar modal de detalles"
                        className="rounded-md px-1 py-1 text-zinc-500 transition-colors hover:cursor-pointer hover:bg-zinc-100 hover:text-zinc-700"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-x-icon lucide-x"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </header>

                {mode === "view" ? (
                    <>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-zinc-500">Empresa</p>
                                <p className="text-sm font-semibold text-zinc-900">{application.company}</p>
                            </div>
                            {application.role ? (
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-zinc-500">Puesto</p>
                                    <p className="text-sm italic text-zinc-700">{application.role}</p>
                                </div>
                            ) : null}
                            {application.description ? (
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-zinc-500">Descripción</p>
                                    <p className="text-sm text-zinc-700">{application.description}</p>
                                </div>
                            ) : null}
                            <div>
                                <p className="text-xs uppercase tracking-wide text-zinc-500">Estado</p>
                                <p className="text-sm text-zinc-800">{APPLICATION_STATUS_LABELS[application.status]}</p>
                            </div>
                        </div>

                        <footer className="mt-6 flex w-full gap-2">
                            <button
                                type="button"
                                onClick={() => setMode("confirmDelete")}
                                className="flex-1 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:cursor-pointer hover:bg-red-50"
                            >
                                Eliminar
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("edit")}
                                className="flex-1 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-zinc-800"
                            >
                                Editar
                            </button>
                        </footer>
                    </>
                ) : mode === "edit" ? (
                    <>
                        <ApplicationForm
                            mode="edit"
                            initialData={application}
                            onCancel={() => setMode("view")}
                            onSuccess={handleClose}
                        />
                    </>
                ) : (
                    <>
                        <div className="space-y-3">
                            <p className="text-sm text-zinc-700">
                                ¿Estás seguro de que quieres eliminar la candidatura a {application.company}
                                {application.role ? ` para el puesto ${application.role}` : ""}?
                            </p>
                        </div>
                        <footer className="mt-6 flex w-full gap-2">
                            <button
                                type="button"
                                onClick={() => setMode("view")}
                                disabled={isDeleting}
                                className="flex-1 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:cursor-pointer hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                            >
                                {isDeleting ? "Eliminando..." : "Eliminar"}
                            </button>
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { createApplicationAction } from "@/app/dashboard/actions";
import { ErrorToast } from "@/components/ErrorToast";
import { APPLICATION_STATUS, type ApplicationStatus } from "@/lib/applications/schema";

type ApplicationFormProps = {
    defaultStatus: ApplicationStatus;
    onSuccess: () => void;
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
    applied: "Aplicado",
    interview: "Entrevista",
    offer: "Oferta",
    rejected: "Rechazado",
    archived: "Archivado",
};

/**
 * Formulario específico para crear candidaturas desde el tablero.
 */
export function ApplicationForm({ defaultStatus, onSuccess }: ApplicationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorState, setErrorState] = useState<{ title: string; details: string[] } | null>(null);

    return (
        <>
            <ErrorToast
                isOpen={errorState !== null}
                title={errorState?.title ?? ""}
                details={errorState?.details ?? []}
                onClose={() => setErrorState(null)}
            />

            <form
                className="space-y-4"
                action={async (formData) => {
                    setIsSubmitting(true);
                    setErrorState(null);

                    try {
                        const result = await createApplicationAction(formData);

                        if (result.success) {
                            onSuccess();
                        } else {
                            setErrorState({
                                title: result.message,
                                details: result.details,
                            });
                        }
                    } finally {
                        setIsSubmitting(false);
                    }
                }}
            >
                <div className="space-y-1">
                    <label htmlFor="company" className="text-sm font-medium text-zinc-800">
                        Empresa
                    </label>
                    <input
                        id="company"
                        name="company"
                        type="text"
                        required
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-500"
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="role" className="text-sm font-medium text-zinc-800">
                        Puesto
                    </label>
                    <input
                        id="role"
                        name="role"
                        type="text"
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-500"
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="description" className="text-sm font-medium text-zinc-800">
                        Descripción
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        className="w-full resize-none rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-500"
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="status" className="text-sm font-medium text-zinc-800">
                        Estado
                    </label>
                    <select
                        id="status"
                        name="status"
                        defaultValue={defaultStatus}
                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-500"
                    >
                        {APPLICATION_STATUS.map((status) => (
                            <option key={status} value={status}>
                                {STATUS_LABELS[status]}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
                >
                    {isSubmitting ? "Creando aplicación..." : "Crear aplicación"}
                </button>
            </form>
        </>
    );
}

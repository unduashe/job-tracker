"use client";

import { useState } from "react";
import {
    createApplicationAction,
    updateApplicationAction,
} from "@/app/dashboard/actions";
import { ErrorToast } from "@/components/ErrorToast";
import { Button } from "@/components/ui/Button";
import { APPLICATION_STATUS, type ApplicationStatus } from "@/lib/applications/schema";
import { APPLICATION_STATUS_LABELS } from "@/lib/applications/constants";
import type { ApplicationRow } from "@/lib/applications/types";

type ApplicationFormProps = {
    defaultStatus?: ApplicationStatus;
    initialData?: ApplicationRow;
    mode?: "create" | "edit";
    onCancel?: () => void;
    onSuccess: () => void;
};

export function ApplicationForm({
    defaultStatus,
    initialData,
    mode = "create",
    onCancel,
    onSuccess,
}: ApplicationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorState, setErrorState] = useState<{ title: string; details: string[] } | null>(null);
    const isEditMode = mode === "edit";
    const statusDefaultValue = initialData?.status ?? defaultStatus ?? "applied";

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        setIsSubmitting(true);
        setErrorState(null);

        try {
            const formData = new FormData(event.currentTarget);
            const result = isEditMode
                ? await updateApplicationAction(formData)
                : await createApplicationAction(formData);

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
    };

    return (
        <>
            <ErrorToast
                isOpen={errorState !== null}
                title={errorState?.title ?? ""}
                details={errorState?.details ?? []}
                onClose={() => setErrorState(null)}
            />

            <form className="space-y-4" onSubmit={handleSubmit}>
                {isEditMode && initialData ? (
                    <input type="hidden" name="applicationId" value={initialData.id} />
                ) : null}

                <div className="space-y-1">
                    <label htmlFor="company" className="text-sm font-medium text-foreground">
                        Empresa
                    </label>
                    <input
                        id="company"
                        name="company"
                        type="text"
                        required
                        defaultValue={initialData?.company ?? ""}
                        className="w-full rounded-md border border-border-strong bg-surface-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="role" className="text-sm font-medium text-foreground">
                        Puesto
                    </label>
                    <input
                        id="role"
                        name="role"
                        type="text"
                        defaultValue={initialData?.role ?? ""}
                        className="w-full rounded-md border border-border-strong bg-surface-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="description" className="text-sm font-medium text-foreground">
                        Descripción
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        defaultValue={initialData?.description ?? ""}
                        className="w-full resize-none rounded-md border border-border-strong bg-surface-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="status" className="text-sm font-medium text-foreground">
                        Estado
                    </label>
                    <select
                        id="status"
                        name="status"
                        defaultValue={statusDefaultValue}
                        className="w-full rounded-md border border-border-strong bg-surface-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    >
                        {APPLICATION_STATUS.map((status) => (
                            <option key={status} value={status}>
                                {APPLICATION_STATUS_LABELS[status]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={isEditMode ? "flex w-full items-stretch gap-2" : ""}>
                    {isEditMode && onCancel ? (
                        <Button
                            variant="secondary"
                            onClick={onCancel}
                            className="flex-1 text-center"
                        >
                            Cancelar
                        </Button>
                    ) : null}

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                        className={`${
                            isEditMode ? "flex-1 text-center" : "w-full"
                        }`}
                    >
                        {isSubmitting
                            ? isEditMode
                                ? "Guardando cambios..."
                                : "Creando aplicación..."
                            : isEditMode
                                ? "Guardar cambios"
                                : "Crear aplicación"}
                    </Button>
                </div>
            </form>
        </>
    );
}
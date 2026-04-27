"use client";

import type { ApplicationStatus } from "@/lib/applications/schema";
import { ApplicationForm } from "@/components/dashboard/ApplicationForm";
import { IconButton } from "@/components/ui/IconButton";
import { CloseIcon } from "@/components/ui/icons";

type ApplicationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    defaultStatus: ApplicationStatus;
};

/**
 * Modal para crear una nueva aplicación desde una columna.
 */
export function ApplicationModal({ isOpen, onClose, defaultStatus }: ApplicationModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-900">Nueva candidatura</h3>
                    <IconButton
                        onClick={onClose}
                        ariaLabel="Cerrar modal"
                        icon={<CloseIcon />}
                        className="text-zinc-500 hover:cursor-pointer hover:bg-zinc-100 hover:text-zinc-700"
                    />
                </div>

                <ApplicationForm defaultStatus={defaultStatus} onSuccess={onClose} />
            </div>
        </div>
    );
}

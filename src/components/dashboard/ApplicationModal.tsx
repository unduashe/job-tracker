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
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4"
            onClick={onClose}
        >
            <div className="w-full max-w-lg rounded-xl border border-border-subtle bg-surface-panel p-6 shadow-modal" onClick={(event) => event.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Nueva candidatura</h3>
                    <IconButton
                        onClick={onClose}
                        ariaLabel="Cerrar modal"
                        icon={<CloseIcon />}
                        className="text-foreground-muted hover:cursor-pointer hover:bg-surface-muted hover:text-foreground"
                    />
                </div>

                <ApplicationForm defaultStatus={defaultStatus} onSuccess={onClose} />
            </div>
        </div>
    );
}

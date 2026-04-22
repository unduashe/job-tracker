"use client";

import type { ApplicationStatus } from "@/lib/applications/schema";
import { ApplicationForm } from "@/components/dashboard/ApplicationForm";

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
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar modal"
                        className="rounded-md px-1 py-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 hover:cursor-pointer"
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
                            className="lucide lucide-x-icon lucide-x">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>

                <ApplicationForm defaultStatus={defaultStatus} onSuccess={onClose} />
            </div>
        </div>
    );
}

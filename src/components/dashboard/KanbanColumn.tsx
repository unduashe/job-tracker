"use client";

import { useState } from "react";
import type { ApplicationStatus } from "@/lib/applications/schema";
import type { ApplicationRow } from "@/lib/applications/types";
import { ApplicationCard } from "@/components/dashboard/ApplicationCard";
import { ApplicationModal } from "@/components/dashboard/ApplicationModal";

type KanbanColumnProps = {
    title: string;
    status: ApplicationStatus;
    applications: ApplicationRow[];
    onOpenDetails: (application: ApplicationRow) => void;
};

/**
 * Renderiza una columna del tablero Kanban.
 */
export function KanbanColumn({ title, status, applications, onOpenDetails }: KanbanColumnProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isAppliedEmpty = status === "applied" && applications.length === 0;

    return (
        <>
            <section className="flex max-h-full min-h-0 min-w-72 basis-72 flex-1 flex-col self-start overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                <header className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
                    <h2 className="text-sm font-semibold text-zinc-800">{title}</h2>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        aria-label={`Añadir candidatura en ${title}`}
                        className="rounded-md px-1 py-1 text-lg leading-none text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
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
                            className="lucide lucide-plus-icon lucide-plus"
                        >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                        </svg>
                    </button>
                </header>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3">
                    {isAppliedEmpty ? (
                        <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-600">
                            Empieza creando tu primera candidatura con el botón +
                        </p>
                    ) : null}

                    {applications.map((application) => (
                        <ApplicationCard
                            key={application.id}
                            application={application}
                            onOpenDetails={onOpenDetails}
                        />
                    ))}
                </div>
            </section>

            <ApplicationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                defaultStatus={status}
            />
        </>
    );
}

"use client";

import { useDroppable } from "@dnd-kit/core";
import { useCallback } from "react";
import type { ApplicationStatus } from "@/lib/applications/schema";
import type { ApplicationRow } from "@/lib/applications/types";
import { ApplicationCard } from "@/components/dashboard/ApplicationCard";
import { IconButton } from "@/components/ui/IconButton";
import { PlusIcon } from "@/components/ui/icons";

type KanbanColumnProps = {
    title: string;
    status: ApplicationStatus;
    applications: ApplicationRow[];
    isBoardEmpty: boolean;
    onOpenCreateModal: (status: ApplicationStatus) => void;
    onOpenDetails: (application: ApplicationRow) => void;
    onScrollContainerMount: (status: ApplicationStatus, element: HTMLDivElement | null) => void;
};

/**
 * Renderiza una columna del tablero Kanban.
 */
export function KanbanColumn({
    title,
    status,
    applications,
    isBoardEmpty,
    onOpenCreateModal,
    onOpenDetails,
    onScrollContainerMount,
}: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const showEmptyState = status === "applied" && isBoardEmpty;
    const setScrollContainerRef = useCallback(
        (element: HTMLDivElement | null) => {
            onScrollContainerMount(status, element);
        },
        [onScrollContainerMount, status],
    );

    return (
        <>
            <section
                ref={setNodeRef}
                className={`flex max-h-full min-h-0 min-w-72 basis-72 flex-1 flex-col self-start overflow-hidden rounded-xl border border-border-subtle shadow-card ${
                    isOver ? "bg-brand-50" : "bg-surface-panel"
                }`}
            >
                <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                    <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                    <IconButton
                        onClick={() => onOpenCreateModal(status)}
                        ariaLabel={`Añadir candidatura en ${title}`}
                        icon={<PlusIcon />}
                        className="text-foreground-muted hover:bg-brand-50 hover:text-brand-700 hover:cursor-pointer"
                    />
                </header>

                <div
                    ref={setScrollContainerRef}
                    className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3"
                >
                    {showEmptyState ? (
                        <p className="rounded-lg border border-dashed border-border-strong bg-surface-muted p-3 text-sm text-foreground-muted">
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
        </>
    );
}

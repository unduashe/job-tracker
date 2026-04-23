"use client";

import { useState } from "react";
import type { ApplicationRow, GroupedApplications } from "@/lib/applications/types";
import { KANBAN_COLUMNS } from "@/lib/applications/constants";
import { ApplicationDetailsModal } from "@/components/dashboard/ApplicationDetailsModal";
import { KanbanColumn } from "@/components/dashboard/KanbanColumn";

type KanbanBoardProps = {
    groupedApplications: GroupedApplications;
};

/**
 * Renderiza la estructura base del tablero Kanban.
 */
export function KanbanBoard({ groupedApplications }: KanbanBoardProps) {
    const [selectedApplication, setSelectedApplication] = useState<ApplicationRow | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const isBoardEmpty = Object.values(groupedApplications).every((apps) => apps.length === 0);

    const handleOpenDetails = (application: ApplicationRow) => {
        setSelectedApplication(application);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetails = () => {
        setIsDetailsModalOpen(false);
        setSelectedApplication(null);
    };

    return (
        <>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <section className="flex min-h-0 min-w-0 flex-1 items-start gap-4 overflow-x-auto overflow-y-hidden">
                    {KANBAN_COLUMNS.map((column) => (
                        <KanbanColumn
                            key={column.status}
                            title={column.title}
                            status={column.status}
                            applications={groupedApplications[column.status]}
                            isBoardEmpty={isBoardEmpty}
                            onOpenDetails={handleOpenDetails}
                        />
                    ))}
                </section>
            </div>

            <ApplicationDetailsModal
                application={selectedApplication}
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetails}
            />
        </>
    );
}

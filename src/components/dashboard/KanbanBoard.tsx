"use client";

import {
    closestCorners,
    DndContext,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { useState } from "react";
import type { ApplicationStatus } from "@/lib/applications/schema";
import type { ApplicationRow, GroupedApplications } from "@/lib/applications/types";
import { KANBAN_COLUMNS } from "@/lib/applications/constants";
import { ApplicationCard } from "@/components/dashboard/ApplicationCard";
import { ApplicationDetailsModal } from "@/components/dashboard/ApplicationDetailsModal";
import { ApplicationModal } from "@/components/dashboard/ApplicationModal";
import { KanbanColumn } from "@/components/dashboard/KanbanColumn";
import { useKanbanDnd } from "@/hooks/useKanbanDnd";

type KanbanBoardProps = {
    groupedApplications: GroupedApplications;
};

/**
 * Renderiza la estructura base del tablero Kanban.
 */
export function KanbanBoard({ groupedApplications }: KanbanBoardProps) {
    const dnd = useKanbanDnd(groupedApplications);
    const [selectedApplication, setSelectedApplication] = useState<ApplicationRow | null>(null);
    const [isApplicationDetailsModalOpen, setIsApplicationDetailsModalOpen] = useState(false);
    const [isCreateApplicationModalOpen, setIsCreateApplicationModalOpen] = useState(false);
    const [createApplicationModalStatus, setCreateApplicationModalStatus] = useState<ApplicationStatus>(
        KANBAN_COLUMNS[0].status,
    );

    const handleOpenDetails = (application: ApplicationRow) => {
        setSelectedApplication(application);
        setIsApplicationDetailsModalOpen(true);
    };

    const handleCloseDetails = () => {
        setIsApplicationDetailsModalOpen(false);
        setSelectedApplication(null);
    };

    const handleOpenCreateModal = (status: ApplicationStatus) => {
        setCreateApplicationModalStatus(status);
        setIsCreateApplicationModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateApplicationModalOpen(false);
    };

    return (
        <>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <DndContext
                    sensors={dnd.sensors}
                    collisionDetection={closestCorners}
                    onDragStart={dnd.handlers.onDragStart}
                    onDragOver={dnd.handlers.onDragOver}
                    onDragCancel={dnd.handlers.onDragCancel}
                    onDragEnd={dnd.handlers.onDragEnd}
                >
                    <section className="flex min-h-0 min-w-0 flex-1 items-start gap-4 overflow-x-auto overflow-y-hidden">
                        {KANBAN_COLUMNS.map((column) => (
                            <KanbanColumn
                                key={column.status}
                                title={column.title}
                                status={column.status}
                                applications={dnd.columnsData[column.status]}
                                isBoardEmpty={dnd.isBoardEmpty}
                                onOpenCreateModal={handleOpenCreateModal}
                                onOpenDetails={handleOpenDetails}
                                onScrollContainerMount={dnd.handlers.onScrollContainerMount}
                            />
                        ))}
                    </section>
                    <DragOverlay 
                        dropAnimation={{
                            sideEffects: defaultDropAnimationSideEffects({
                                styles: {
                                    active: {
                                        opacity: "0.65",
                                    },
                                },
                            }),
                        }}
                    >
                        {dnd.activeDragApp ? (
                            <ApplicationCard
                                application={dnd.activeDragApp}
                                isOverlay
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            <ApplicationDetailsModal
                application={selectedApplication}
                isOpen={isApplicationDetailsModalOpen}
                onClose={handleCloseDetails}
            />
            <ApplicationModal
                isOpen={isCreateApplicationModalOpen}
                onClose={handleCloseCreateModal}
                defaultStatus={createApplicationModalStatus}
            />
        </>
    );
}

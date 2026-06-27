"use client";

import {
    closestCorners,
    DndContext,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { useEffect, useState } from "react";
import type { ApplicationStatus } from "@/lib/applications/schema";
import type { ApplicationRow } from "@/lib/applications/types";
import { KANBAN_COLUMNS } from "@/lib/applications/constants";
import { ApplicationCard } from "@/components/dashboard/ApplicationCard";
import { ApplicationDetailsModal } from "@/components/dashboard/ApplicationDetailsModal";
import { ApplicationModal } from "@/components/dashboard/ApplicationModal";
import { useDashboardResponsive } from "@/components/dashboard/DashboardResponsiveProvider";
import { ErrorToast } from "@/components/ErrorToast";
import { KanbanColumn } from "@/components/dashboard/KanbanColumn";
import { useKanbanDnd } from "@/hooks/useKanbanDnd";

/**
 * Renderiza la estructura base del tablero Kanban.
 * Lee el estado del `DashboardDataProvider` para ser idéntico en auth y guest.
 */
export function KanbanBoard() {
    const dnd = useKanbanDnd();
    const { activeStatus } = useDashboardResponsive();
    const [isMobileLayout, setIsMobileLayout] = useState(() => {
        if (typeof window === "undefined") {
            return false;
        }

        return window.matchMedia("(max-width: 1023px)").matches;
    });
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
    const [isApplicationDetailsModalOpen, setIsApplicationDetailsModalOpen] = useState(false);
    const [isCreateApplicationModalOpen, setIsCreateApplicationModalOpen] = useState(false);
    const [createApplicationModalStatus, setCreateApplicationModalStatus] = useState<ApplicationStatus>(
        KANBAN_COLUMNS[0].status,
    );

    const selectedApplication = selectedApplicationId
        ? findApplicationById(dnd.columnsData, selectedApplicationId)
        : null;

    const handleOpenDetails = (application: ApplicationRow) => {
        setSelectedApplicationId(application.id);
        setIsApplicationDetailsModalOpen(true);
    };

    const handleCloseDetails = () => {
        setIsApplicationDetailsModalOpen(false);
        setSelectedApplicationId(null);
    };

    const handleOpenCreateModal = (status: ApplicationStatus) => {
        setCreateApplicationModalStatus(status);
        setIsCreateApplicationModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateApplicationModalOpen(false);
    };

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 1023px)");
        const handleMediaChange = (event: MediaQueryListEvent) => {
            setIsMobileLayout(event.matches);
        };

        mediaQuery.addEventListener("change", handleMediaChange);

        return () => {
            mediaQuery.removeEventListener("change", handleMediaChange);
        };
    }, []);

    const boardContent = (
        <section className="flex min-h-0 min-w-0 flex-1 items-start gap-4 overflow-hidden lg:overflow-x-auto lg:overflow-y-hidden">
            {KANBAN_COLUMNS.map((column) => (
                <KanbanColumn
                    key={column.status}
                    title={column.title}
                    status={column.status}
                    isActiveOnMobile={column.status === activeStatus}
                    applications={dnd.columnsData[column.status]}
                    isBoardEmpty={dnd.isBoardEmpty}
                    onOpenCreateModal={handleOpenCreateModal}
                    onOpenDetails={handleOpenDetails}
                    onScrollContainerMount={dnd.handlers.onScrollContainerMount}
                />
            ))}
        </section>
    );

    return (
        <>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {isMobileLayout ? (
                    boardContent
                ) : (
                    <DndContext
                        sensors={dnd.sensors}
                        collisionDetection={closestCorners}
                        onDragStart={dnd.handlers.onDragStart}
                        onDragOver={dnd.handlers.onDragOver}
                        onDragCancel={dnd.handlers.onDragCancel}
                        onDragEnd={dnd.handlers.onDragEnd}
                    >
                        {boardContent}
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
                )}
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
            <ErrorToast
                isOpen={dnd.dndError !== null}
                title={dnd.dndError?.title ?? ""}
                details={dnd.dndError?.details ?? []}
                onClose={dnd.clearDndError}
            />
        </>
    );
}

function findApplicationById(
    grouped: ReturnType<typeof useKanbanDnd>["columnsData"],
    id: string,
): ApplicationRow | null {
    for (const column of KANBAN_COLUMNS) {
        const found = grouped[column.status].find((application) => application.id === id);
        if (found) {
            return found;
        }
    }

    return null;
}

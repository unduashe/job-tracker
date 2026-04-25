"use client";

import {
    closestCorners,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragOverEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { useCallback, useRef, useState } from "react";
import { updateApplicationStatusAction } from "@/app/dashboard/actions";
import type { ApplicationStatus } from "@/lib/applications/schema";
import type { ApplicationRow, GroupedApplications } from "@/lib/applications/types";
import { KANBAN_COLUMNS } from "@/lib/applications/constants";
import { ApplicationCard } from "@/components/dashboard/ApplicationCard";
import { ApplicationDetailsModal } from "@/components/dashboard/ApplicationDetailsModal";
import { ApplicationModal } from "@/components/dashboard/ApplicationModal";
import { KanbanColumn } from "@/components/dashboard/KanbanColumn";

type KanbanBoardProps = {
    groupedApplications: GroupedApplications;
};

type OptimisticColumnsState = {
    base: GroupedApplications;
    data: GroupedApplications;
};

function restoreApplicationToOriginPosition(
    columnsData: GroupedApplications,
    applicationId: string,
    originStatus: ApplicationStatus,
    originIndex: number,
): GroupedApplications | null {
    let draggedApplication: ApplicationRow | null = null;
    let hasChanges = false;
    const nextColumnsData: GroupedApplications = { ...columnsData };

    for (const column of KANBAN_COLUMNS) {
        const currentStatus = column.status;
        const currentApplications = nextColumnsData[currentStatus];
        const currentIndex = currentApplications.findIndex((application) => application.id === applicationId);

        if (currentIndex === -1) {
            continue;
        }

        draggedApplication = currentApplications[currentIndex];
        nextColumnsData[currentStatus] = currentApplications.filter(
            (application) => application.id !== applicationId,
        );
        hasChanges = true;
    }

    if (!draggedApplication || !hasChanges) {
        return null;
    }

    const originApplications = nextColumnsData[originStatus];
    const safeOriginIndex = Math.min(Math.max(originIndex, 0), originApplications.length);
    const alreadyInCorrectPosition =
        originApplications[safeOriginIndex]?.id === applicationId &&
        draggedApplication.status === originStatus;

    if (alreadyInCorrectPosition) {
        return null;
    }

    nextColumnsData[originStatus] = [
        ...originApplications.slice(0, safeOriginIndex),
        { ...draggedApplication, status: originStatus },
        ...originApplications.slice(safeOriginIndex),
    ];

    return nextColumnsData;
}

function scrollColumnToBottom(
    columnScrollContainers: Partial<Record<ApplicationStatus, HTMLDivElement>>,
    status: ApplicationStatus,
): void {
    const container = columnScrollContainers[status];
    if (!container) {
        return;
    }

    container.scrollTop = Number.MAX_SAFE_INTEGER;
}

function enforceScrollColumnToBottomForFrames(
    columnScrollContainers: Partial<Record<ApplicationStatus, HTMLDivElement>>,
    status: ApplicationStatus,
    remainingFrames: number,
): void {
    if (remainingFrames <= 0) {
        return;
    }

    scrollColumnToBottom(columnScrollContainers, status);
    requestAnimationFrame(() => {
        enforceScrollColumnToBottomForFrames(
            columnScrollContainers,
            status,
            remainingFrames - 1,
        );
    });
}

function scrollColumnToBottomAfterNextPaint(
    columnScrollContainers: Partial<Record<ApplicationStatus, HTMLDivElement>>,
    status: ApplicationStatus,
): void {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            enforceScrollColumnToBottomForFrames(columnScrollContainers, status, 12);
        });
    });
}

function moveApplicationBetweenColumns(
    columnsData: GroupedApplications,
    applicationId: string,
    destinationStatus: ApplicationStatus,
): GroupedApplications | null {
    const sourceStatus = KANBAN_COLUMNS.find((column) =>
        columnsData[column.status].some((application) => application.id === applicationId),
    )?.status;

    if (!sourceStatus || sourceStatus === destinationStatus) {
        return null;
    }

    const movedApplication = columnsData[sourceStatus].find(
        (application) => application.id === applicationId,
    );

    if (!movedApplication) {
        return null;
    }

    return {
        ...columnsData,
        [sourceStatus]: columnsData[sourceStatus].filter((application) => application.id !== applicationId),
        [destinationStatus]: [
            { ...movedApplication, status: destinationStatus },
            ...columnsData[destinationStatus],
        ],
    };
}

/**
 * Renderiza la estructura base del tablero Kanban.
 */
export function KanbanBoard({ groupedApplications }: KanbanBoardProps) {
    const [optimisticColumnsState, setOptimisticColumnsState] = useState<OptimisticColumnsState | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<ApplicationRow | null>(null);
    const [isApplicationDetailsModalOpen, setIsApplicationDetailsModalOpen] = useState(false);
    const [isCreateApplicationModalOpen, setIsCreateApplicationModalOpen] = useState(false);
    const [createApplicationModalStatus, setCreateApplicationModalStatus] = useState<ApplicationStatus>(
        KANBAN_COLUMNS[0].status,
    );
    const [activeDragApp, setActiveDragApp] = useState<ApplicationRow | null>(null);
    const [dragStartStatus, setDragStartStatus] = useState<ApplicationStatus | null>(null);
    const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
    const columnScrollContainersRef = useRef<Partial<Record<ApplicationStatus, HTMLDivElement>>>({});
    const lastAutoScrolledStatusRef = useRef<ApplicationStatus | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
    );
    const columnsData =
        optimisticColumnsState && optimisticColumnsState.base === groupedApplications
            ? optimisticColumnsState.data
            : groupedApplications;
    const isBoardEmpty = Object.values(columnsData).every((apps) => apps.length === 0);

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

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragApp(event.active.data.current as ApplicationRow);
        const startStatus = event.active.data.current?.status as ApplicationStatus | null;
        setDragStartStatus(startStatus);
        const applicationId = String(event.active.id);
        const startIndex =
            startStatus !== null
                ? columnsData[startStatus].findIndex((application) => application.id === applicationId)
                : -1;
        setDragStartIndex(startIndex >= 0 ? startIndex : null);
        lastAutoScrolledStatusRef.current = null;
    };

    const handleScrollContainerMount = useCallback(
        (status: ApplicationStatus, element: HTMLDivElement | null) => {
            if (element) {
                columnScrollContainersRef.current[status] = element;
                return;
            }

            delete columnScrollContainersRef.current[status];
        },
        [],
    );

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        if (!over) {
            return;
        }

        const destinationStatus = over.id as ApplicationStatus;
        const shouldAutoScrollDestination =
            dragStartStatus !== null && destinationStatus !== dragStartStatus;

        if (shouldAutoScrollDestination && lastAutoScrolledStatusRef.current !== destinationStatus) {
            const destinationScrollContainer = columnScrollContainersRef.current[destinationStatus];
            if (destinationScrollContainer) {
                destinationScrollContainer.scrollTop = 0;
            }
            lastAutoScrolledStatusRef.current = destinationStatus;
        }

        const applicationId = String(active.id);
        if (
            dragStartStatus !== null &&
            dragStartIndex !== null &&
            destinationStatus === dragStartStatus
        ) {
            const wasLastElementAtDragStart =
                dragStartIndex === groupedApplications[dragStartStatus].length - 1;

            const restoredColumnsData = restoreApplicationToOriginPosition(
                columnsData,
                applicationId,
                dragStartStatus,
                dragStartIndex,
            );

            if (!restoredColumnsData) {
                return;
            }

            setOptimisticColumnsState({
                base: groupedApplications,
                data: restoredColumnsData,
            });
            if (wasLastElementAtDragStart) {
                scrollColumnToBottomAfterNextPaint(
                    columnScrollContainersRef.current,
                    dragStartStatus,
                );
            }
            return;
        }

        const nextColumnsData = moveApplicationBetweenColumns(
            columnsData,
            applicationId,
            destinationStatus,
        );

        if (!nextColumnsData) {
            return;
        }

        setOptimisticColumnsState({
            base: groupedApplications,
            data: nextColumnsData,
        });
    };

    const handleDragCancel = () => {
        setOptimisticColumnsState(null);
        setActiveDragApp(null);
        setDragStartStatus(null);
        setDragStartIndex(null);
        lastAutoScrolledStatusRef.current = null;
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragApp(null);

        if (!over) {
            setOptimisticColumnsState(null);
            setDragStartStatus(null);
            setDragStartIndex(null);
            lastAutoScrolledStatusRef.current = null;
            return;
        }

        const destinationStatus = over.id as ApplicationStatus;
        const applicationId = String(active.id);
        const sourceStatus = dragStartStatus;
        if (!sourceStatus || sourceStatus === destinationStatus) {
            setDragStartStatus(null);
            setDragStartIndex(null);
            return;
        }

        const previousOptimisticColumnsState = optimisticColumnsState;
        const nextColumnsData =
            moveApplicationBetweenColumns(columnsData, applicationId, destinationStatus) ?? columnsData;

        setOptimisticColumnsState({
            base: groupedApplications,
            data: nextColumnsData,
        });

        const result = await updateApplicationStatusAction(applicationId, destinationStatus);
        setDragStartStatus(null);
        setDragStartIndex(null);
        lastAutoScrolledStatusRef.current = null;

        if (!result.success) {
            console.error("handleDragEnd error:", result.message);
            setOptimisticColumnsState(previousOptimisticColumnsState);
        }
    };

    return (
        <>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragCancel={handleDragCancel}
                    onDragEnd={handleDragEnd}
                >
                    <section className="flex min-h-0 min-w-0 flex-1 items-start gap-4 overflow-x-auto overflow-y-hidden">
                        {KANBAN_COLUMNS.map((column) => (
                            <KanbanColumn
                                key={column.status}
                                title={column.title}
                                status={column.status}
                                applications={columnsData[column.status]}
                                isBoardEmpty={isBoardEmpty}
                                onOpenCreateModal={handleOpenCreateModal}
                                onOpenDetails={handleOpenDetails}
                                onScrollContainerMount={handleScrollContainerMount}
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
                        {activeDragApp ? (
                            <ApplicationCard
                                application={activeDragApp}
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

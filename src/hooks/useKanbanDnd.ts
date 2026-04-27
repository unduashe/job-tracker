"use client";

import { useCallback, useRef, useState } from "react";
import {
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { updateApplicationStatusAction } from "@/app/dashboard/actions";
import type { ApplicationStatus } from "@/lib/applications/schema";
import type { ApplicationRow, GroupedApplications } from "@/lib/applications/types";
import {
    moveApplicationBetweenColumns,
    restoreApplicationToOriginPosition,
    scrollColumnToBottomAfterNextPaint,
} from "@/lib/applications/dnd-utils";

type OptimisticColumnsState = {
    base: GroupedApplications;
    data: GroupedApplications;
};

type UseKanbanDndResult = {
    sensors: ReturnType<typeof useSensors>;
    columnsData: GroupedApplications;
    activeDragApp: ApplicationRow | null;
    isBoardEmpty: boolean;
    handlers: {
        onDragStart: (event: DragStartEvent) => void;
        onDragOver: (event: DragOverEvent) => void;
        onDragCancel: () => void;
        onDragEnd: (event: DragEndEvent) => Promise<void>;
        onScrollContainerMount: (status: ApplicationStatus, element: HTMLDivElement | null) => void;
    };
};

/**
 * Encapsula la lógica de drag and drop del tablero Kanban.
 */
export function useKanbanDnd(groupedApplications: GroupedApplications): UseKanbanDndResult {
    const [optimisticColumnsState, setOptimisticColumnsState] = useState<OptimisticColumnsState | null>(null);
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
    const isBoardEmpty = Object.values(columnsData).every((applications) => applications.length === 0);

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

    return {
        sensors,
        columnsData,
        activeDragApp,
        isBoardEmpty,
        handlers: {
            onDragStart: handleDragStart,
            onDragOver: handleDragOver,
            onDragCancel: handleDragCancel,
            onDragEnd: handleDragEnd,
            onScrollContainerMount: handleScrollContainerMount,
        },
    };
}

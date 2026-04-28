import { KANBAN_COLUMNS } from "@/lib/applications/constants";
import type { ApplicationStatus } from "@/lib/applications/schema";
import type { ApplicationRow, GroupedApplications } from "@/lib/applications/types";

export function restoreApplicationToOriginPosition(
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

export function moveApplicationBetweenColumns(
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

export function scrollColumnToBottom(
    columnScrollContainers: Partial<Record<ApplicationStatus, HTMLDivElement>>,
    status: ApplicationStatus,
): void {
    const container = columnScrollContainers[status];
    if (!container) {
        return;
    }

    container.scrollTop = Number.MAX_SAFE_INTEGER;
}

export function enforceScrollColumnToBottomForFrames(
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

export function scrollColumnToBottomAfterNextPaint(
    columnScrollContainers: Partial<Record<ApplicationStatus, HTMLDivElement>>,
    status: ApplicationStatus,
): void {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            enforceScrollColumnToBottomForFrames(columnScrollContainers, status, 12);
        });
    });
}

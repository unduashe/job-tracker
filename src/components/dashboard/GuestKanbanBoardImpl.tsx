"use client";

import { useEffect, useMemo } from "react";
import {
    DashboardDataProvider,
    useDashboardData,
} from "@/components/dashboard/DashboardDataProvider";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { createLocalDataApi } from "@/lib/applications/dataApi/localDataApi";
import {
    readPersistedSnapshot,
    snapshotToGrouped,
    subscribeToStorage,
} from "@/lib/applications/local/storage";

/**
 * Implementación cliente del tablero en modo invitado.
 * Gracias al wrapper, el tablero se carga en el cliente y se muestra un skeleton mientras se hidrata.
 */
export function GuestKanbanBoardImpl() {
    const api = useMemo(() => createLocalDataApi(), []);

    return (
        <DashboardDataProvider api={api}>
            <GuestStorageSync />
            <KanbanBoard />
        </DashboardDataProvider>
    );
}

/**
 * Sincroniza el estado del provider con cambios de localStorage producidos
 * en otras pestañas. No tiene UI, vive en el provider trabajando por detrás.
 */
function GuestStorageSync() {
    const { setGroupedApplications } = useDashboardData();

    useEffect(() => {
        return subscribeToStorage(() => {
            setGroupedApplications(snapshotToGrouped(readPersistedSnapshot()));
        });
    }, [setGroupedApplications]);

    return null;
}
